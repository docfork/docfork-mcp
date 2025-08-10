#!/usr/bin/env node

/**
 * Docfork MCP Server
 *
 * Updated to use modern Streamable HTTP transport with proper session management:
 * - Session ID generation and storage for stateful connections
 * - Request body parsing for POST requests
 * - Proper CORS headers with Mcp-Session-Id exposure
 * - Flexible hostname support for deployment environments
 * - Support for GET/DELETE requests for SSE notifications and session termination
 * - Backwards compatibility with legacy SSE transport
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetchLibraryDocs } from "./api.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { parse } from "url";
import { randomUUID } from "node:crypto";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { IncomingMessage } from "http";

// Load environment variables from .env file if present
dotenv.config();

// Get DEFAULT_MINIMUM_TOKENS from environment variable or use default
let DEFAULT_MINIMUM_TOKENS = 10000;
if (process.env.DEFAULT_MINIMUM_TOKENS) {
  const parsedValue = parseInt(process.env.DEFAULT_MINIMUM_TOKENS, 10);
  if (!isNaN(parsedValue) && parsedValue > 0) {
    DEFAULT_MINIMUM_TOKENS = parsedValue;
  } else {
    console.warn(
      `Warning: Invalid DEFAULT_MINIMUM_TOKENS value provided in environment variable. Using default value of 10000`
    );
  }
}

// Store transports by session ID
const streamableTransports: Record<string, StreamableHTTPServerTransport> = {};
const sseTransports: Record<string, SSEServerTransport> = {};

function getClientIp(req: IncomingMessage): string | undefined {
  // Check both possible header casings
  const forwardedFor =
    req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"];

  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const ipList = ips.split(",").map((ip) => ip.trim());

    // Find the first public IP address
    for (const ip of ipList) {
      const plainIp = ip.replace(/^::ffff:/, "");
      if (
        !plainIp.startsWith("10.") &&
        !plainIp.startsWith("192.168.") &&
        !/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(plainIp)
      ) {
        return plainIp;
      }
    }
    // If all are private, use the first one
    return ipList[0].replace(/^::ffff:/, "");
  }

  // Fallback: use remote address, strip IPv6-mapped IPv4
  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress.replace(/^::ffff:/, "");
  }
  return undefined;
}

// Helper function to parse request body
function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        if (body) {
          resolve(JSON.parse(body));
        } else {
          resolve({});
        }
      } catch (error) {
        reject(new Error("Invalid JSON in request body"));
      }
    });
    req.on("error", (error) => {
      reject(error);
    });
  });
}

// Function to create a new server instance with all tools registered
function createServerInstance() {
  const server = new McpServer({
    name: "Docfork",
    description:
      "Gets the latest documentation and code examples for any library.",
    version: "0.6.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  // Register Docfork tool
  server.registerTool(
    "get-library-docs",
    {
      title: "Get Library Documentation",
      description: `Retrieves up-to-date documentation and code examples for any library. This tool automatically searches for the library by name and fetches its documentation.

Usage:
1. Provide the author and library name pair (e.g., "vercel/next.js", "shadcn-ui/ui", "vuejs/docs")
2. Specify a topic to focus the documentation on (e.g., "dynamic", "routing", "authentication")

The tool will:
1. Automatically find and select the most relevant library based on the provided name
2. Fetch comprehensive documentation for the selected library
3. Return relevant sections focused on the specified topic

Response includes:
- Library selection explanation
- Comprehensive documentation with code examples
- Focused content if a topic was specified`,
      inputSchema: {
        libraryName: z
          .string()
          .describe(
            "Author and library name pair to search for and retrieve documentation (e.g., 'vercel/next.js', 'reactjs/react.dev', 'vuejs/docs')"
          ),
        topic: z
          .string()
          .describe(
            "Topic to focus documentation on (e.g., 'hooks', 'routing', 'authentication')"
          ),
        tokens: z
          .preprocess(
            (val) => (typeof val === "string" ? Number(val) : val),
            z.number()
          )
          .transform((val) =>
            val < DEFAULT_MINIMUM_TOKENS ? DEFAULT_MINIMUM_TOKENS : val
          )
          .optional()
          .describe(
            `Maximum number of tokens of documentation to retrieve (default: ${DEFAULT_MINIMUM_TOKENS}). Higher values provide more context but consume more tokens.`
          ),
      },
    },
    async ({ libraryName, topic, tokens = DEFAULT_MINIMUM_TOKENS }) => {
      try {
        // Step 1: Search for libraries
        const searchResponse = await fetchLibraryDocs(
          libraryName,
          topic,
          tokens
        );

        if (!searchResponse) {
          return {
            content: [
              {
                type: "text",
                text: `No libraries found matching "${libraryName}". Please try a different library name or check the spelling.`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: searchResponse,
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving documentation for "${libraryName}" (topic: "${topic}"): ${errorMessage}`,
            },
          ],
        };
      }
    }
  );

  return server;
}

async function main() {
  const transportType = process.env.MCP_TRANSPORT || "stdio";

  if (transportType === "streamable-http" || transportType === "sse") {
    // Get initial port from environment or use default
    const initialPort = process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : 3000;
    // Keep track of which port we end up using
    let actualPort = initialPort;
    const httpServer = createServer(async (req, res) => {
      const url = parse(req.url || "").pathname;

      // Set CORS headers for all responses
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, MCP-Session-Id, mcp-session-id, MCP-Protocol-Version"
      );
      res.setHeader("Access-Control-Expose-Headers", "MCP-Session-Id");

      // Handle preflight OPTIONS requests
      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }

      try {
        // Extract client IP address for tracking
        const clientIp = getClientIp(req);

        if (url === "/mcp") {
          // Parse request body for POST requests
          let requestBody = {};
          if (req.method === "POST") {
            try {
              requestBody = await parseRequestBody(req);
            } catch (error) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  jsonrpc: "2.0",
                  error: {
                    code: -32700,
                    message: "Parse error",
                  },
                  id: null,
                })
              );
              return;
            }
          }

          // Check for existing session ID
          const sessionId = req.headers["mcp-session-id"] as string | undefined;
          let transport: StreamableHTTPServerTransport;

          if (sessionId && streamableTransports[sessionId]) {
            // Reuse existing transport
            transport = streamableTransports[sessionId];
          } else if (!sessionId && isInitializeRequest(requestBody)) {
            // New initialization request
            transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => randomUUID(),
              onsessioninitialized: (sessionId) => {
                // Store the transport by session ID
                streamableTransports[sessionId] = transport;
              },
            });

            // Clean up transport when closed
            transport.onclose = () => {
              if (transport.sessionId) {
                delete streamableTransports[transport.sessionId];
              }
            };

            // Create new server instance and connect
            const server = createServerInstance();
            await server.connect(transport);
          } else {
            // Invalid request
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                jsonrpc: "2.0",
                error: {
                  code: -32000,
                  message: "Bad Request: No valid session ID provided",
                },
                id: null,
              })
            );
            return;
          }

          // Handle the request
          await transport.handleRequest(req, res, requestBody);
        } else if (url === "/mcp" && req.method === "GET") {
          // Handle GET requests for server-to-client notifications via SSE
          const sessionId = req.headers["mcp-session-id"] as string | undefined;
          if (!sessionId || !streamableTransports[sessionId]) {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("Invalid or missing session ID");
            return;
          }

          const transport = streamableTransports[sessionId];
          await transport.handleRequest(req, res);
        } else if (url === "/mcp" && req.method === "DELETE") {
          // Handle DELETE requests for session termination
          const sessionId = req.headers["mcp-session-id"] as string | undefined;
          if (!sessionId || !streamableTransports[sessionId]) {
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end("Invalid or missing session ID");
            return;
          }

          const transport = streamableTransports[sessionId];
          await transport.handleRequest(req, res);
        } else if (url === "/sse" && req.method === "GET") {
          // Create new SSE transport for GET request
          const sseTransport = new SSEServerTransport("/messages", res);
          // Store the transport by session ID
          sseTransports[sseTransport.sessionId] = sseTransport;
          // Clean up transport when connection closes
          res.on("close", () => {
            delete sseTransports[sseTransport.sessionId];
          });
          // Create new server instance for this SSE connection
          const sseServer = createServerInstance();
          await sseServer.connect(sseTransport);
        } else if (url === "/messages" && req.method === "POST") {
          // Get session ID from query parameters
          const parsedUrl = parse(req.url || "", true);
          const sessionId = parsedUrl.query.sessionId as string;

          if (!sessionId) {
            res.writeHead(400);
            res.end("Missing sessionId parameter");
            return;
          }

          // Get existing transport for this session
          const sseTransport = sseTransports[sessionId];
          if (!sseTransport) {
            res.writeHead(400);
            res.end(`No transport found for sessionId: ${sessionId}`);
            return;
          }

          // Handle the POST message with the existing transport
          await sseTransport.handlePostMessage(req, res);
        } else if (url === "/ping") {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("pong");
        } else {
          res.writeHead(404);
          res.end("Not found");
        }
      } catch (error) {
        console.error("Error handling request:", error);
        if (!res.headersSent) {
          res.writeHead(500);
          res.end("Internal Server Error");
        }
      }
    });

    // Function to attempt server listen with port fallback
    const startServer = (port: number, maxAttempts = 10) => {
      httpServer.once("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE" && port < initialPort + maxAttempts) {
          console.warn(`Port ${port} is in use, trying port ${port + 1}...`);
          startServer(port + 1, maxAttempts);
        } else {
          console.error(`Failed to start server: ${err.message}`);
          process.exit(1);
        }
      });

      httpServer.listen(port, () => {
        actualPort = port;
        console.error(
          `Docfork Documentation MCP Server running on ${transportType.toUpperCase()}:`
        );
        console.error(
          `  • Streamable HTTP: http://localhost:${actualPort}/mcp`
        );
        console.error(`  • Legacy SSE: http://localhost:${actualPort}/sse`);
        console.error(`  • Health check: http://localhost:${actualPort}/ping`);
      });
    };

    // Start the server with initial port
    startServer(initialPort);
  } else {
    // Stdio transport - this is already stateless by nature
    const server = createServerInstance();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Docfork Documentation MCP Server running on stdio");
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
