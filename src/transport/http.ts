import { createServer } from "http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { parse } from "url";
import { randomUUID } from "node:crypto";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createServerInstance } from "../server/server.js";
import { ServerConfig } from "../server/config.js";
import { getClientIp, parseRequestBody } from "./utils.js";
import escape from "escape-html";

// Store transports by session ID
const streamableTransports: Record<string, StreamableHTTPServerTransport> = {};
const sseTransports: Record<string, SSEServerTransport> = {};

/**
 * Start the server with HTTP-based transports (streamable-http or sse)
 */
export async function startHttpServer(config: ServerConfig): Promise<void> {
  // Get initial port from config
  const initialPort = config.port;
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
          const server = createServerInstance(config);
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
        const sseServer = createServerInstance(config);
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
          res.end(`No transport found for sessionId: ${escape(sessionId)}`);
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
        `Docfork Documentation MCP Server running on ${config.transport.toUpperCase()}:`
      );
      console.error(`  • Streamable HTTP: http://localhost:${actualPort}/mcp`);
      console.error(`  • Legacy SSE: http://localhost:${actualPort}/sse`);
      console.error(`  • Health check: http://localhost:${actualPort}/ping`);
    });
  };

  // Start the server with initial port
  startServer(initialPort);
}
