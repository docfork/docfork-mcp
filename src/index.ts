#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetchLibraryDocs } from "./api.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { parse } from "url";

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

// Store SSE transports by session ID
const sseTransports: Record<string, SSEServerTransport> = {};

// Function to create a new server instance with all tools registered
function createServerInstance() {
  const server = new McpServer({
    name: "Docfork",
    description:
      "Gets the latest documentation and code examples for any library.",
    version: "0.5.0",
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

  if (transportType === "http" || transportType === "sse") {
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
        "Content-Type, MCP-Session-Id, mcp-session-id"
      );

      // Handle preflight OPTIONS requests
      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }

      try {
        // Create new server instance for each request
        const requestServer = createServerInstance();

        if (url === "/mcp") {
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
          });
          await requestServer.connect(transport);
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
          await requestServer.connect(sseTransport);
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
          `Docfork Documentation MCP Server running on ${transportType.toUpperCase()} at http://localhost:${actualPort}/mcp and legacy SSE at /sse`
        );
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
