import { createServer } from "http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { parse } from "url";
import { randomUUID } from "node:crypto";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createServerInstance } from "../server/server.js";
import { ServerConfig } from "../server/middleware.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { IncomingMessage } from "node:http";

// Session management - persistent storage by session ID
const transports: Record<string, StreamableHTTPServerTransport> = {};
const servers: Record<string, Server> = {};
const sessionClientInfo: Record<string, { name?: string; userAgent?: string }> =
  {};

/**
 * Get information about active sessions (for debugging/monitoring)
 */
function getSessionInfo() {
  return {
    activeSessions: Object.keys(transports).length,
    sessionIds: Object.keys(transports),
    clientInfo: { ...sessionClientInfo },
  };
}

/**
 * Parse request body as JSON
 */
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
        console.error("Error parsing request body:", error);
        reject(new Error("Invalid JSON in request body"));
      }
    });
    req.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Clean up a specific session by ID
 */
export function cleanupSession(sessionId: string): boolean {
  if (!transports[sessionId]) {
    return false;
  }

  const transport = transports[sessionId];
  delete transports[sessionId];
  delete servers[sessionId];
  delete sessionClientInfo[sessionId];

  // Close transport if it has a close method
  if (transport && typeof transport.close === "function") {
    transport.close();
  }

  return true;
}

/**
 * Start the server with HTTP-based transports (streamable-http)
 */
export async function startHttpServer(config: ServerConfig): Promise<void> {
  try {
    // Get initial port from config
    const initialPort = config.port;
    // Keep track of which port we end up using
    let actualPort = initialPort;

    const httpServer = createServer(async (req, res) => {
      const url = parse(req.url || "").pathname;
      const requestStart = Date.now();

      // Set a reasonable timeout for requests (10 seconds)
      req.setTimeout(10000);
      res.setTimeout(10000);

      // Set CORS headers for all responses
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, MCP-Session-Id, mcp-session-id, MCP-Protocol-Version"
      );
      res.setHeader("Access-Control-Expose-Headers", "MCP-Session-Id");

      // Log incoming requests
      console.error(`[${new Date().toISOString()}] ${req.method} ${url}`);

      // Handle preflight OPTIONS requests
      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }

      try {
        if (url === "/mcp") {
          if (req.method === "POST") {
            // Ensure Accept header includes required content types for MCP
            // Some clients (like Smithery scanner) may not send proper Accept headers
            if (
              !req.headers.accept ||
              !req.headers.accept.includes("text/event-stream")
            ) {
              req.headers.accept = "application/json, text/event-stream";
              console.error("Added Accept headers for client compatibility");
            }

            // Parse request body for POST requests
            let requestBody = {};
            try {
              requestBody = await parseRequestBody(req);
              console.error(
                `Request body parsed: ${JSON.stringify(requestBody).substring(0, 200)}`
              );
            } catch (error) {
              console.error(`Failed to parse request body: ${error}`);
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

            // Check for existing session ID
            const sessionId = req.headers["mcp-session-id"] as
              | string
              | undefined;
            let transport: StreamableHTTPServerTransport;

            console.error(`Session ID from header: ${sessionId || "none"}`);
            console.error(
              `Is initialize request: ${isInitializeRequest(requestBody)}`
            );

            if (sessionId && transports[sessionId]) {
              // Reuse existing transport and server
              console.error(`Reusing session: ${sessionId}`);
              transport = transports[sessionId];
            } else if (!sessionId && isInitializeRequest(requestBody)) {
              // New initialization request - create new session
              console.error("Creating new MCP session...");
              try {
                const newSessionId = randomUUID();
                console.error(`Generated session ID: ${newSessionId}`);

                transport = new StreamableHTTPServerTransport({
                  sessionIdGenerator: () => newSessionId,
                });
                console.error("Transport created");

                // Create new server instance
                const server = createServerInstance(config);
                console.error("Server instance created");

                // Store session data
                transports[newSessionId] = transport;
                servers[newSessionId] = server;
                sessionClientInfo[newSessionId] = {
                  name: (requestBody as any)?.params?.clientInfo?.name,
                  userAgent: req.headers["user-agent"],
                };

                // Clean up session when transport closes
                transport.onclose = () => {
                  console.error(`Session closed: ${newSessionId}`);
                  delete transports[newSessionId];
                  delete servers[newSessionId];
                  delete sessionClientInfo[newSessionId];
                };

                // Connect server to transport
                console.error("Connecting server to transport...");
                await server.connect(transport);
                console.error("Server connected successfully");
              } catch (error) {
                console.error("Error initializing session:", error);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    jsonrpc: "2.0",
                    error: {
                      code: -32000,
                      message: `Failed to initialize server session: ${
                        error instanceof Error ? error.message : String(error)
                      }`,
                    },
                    id: null,
                  })
                );
                return;
              }
            } else {
              // Invalid request - missing session ID or not an initialize request
              console.error(
                `Rejecting request - sessionId: ${sessionId}, hasSession: ${sessionId ? !!transports[sessionId] : false}, isInit: ${isInitializeRequest(requestBody)}`
              );
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  jsonrpc: "2.0",
                  error: {
                    code: -32000,
                    message: sessionId
                      ? "Session not found"
                      : "Bad Request: No valid session ID provided",
                  },
                  id: null,
                })
              );
              return;
            }

            // Handle the request
            console.error("Handling request via transport...");
            await transport.handleRequest(req, res, requestBody);
            console.error("Request handled successfully");
          } else if (req.method === "GET") {
            // Handle GET request for SSE stream
            const sessionId = req.headers["mcp-session-id"] as
              | string
              | undefined;

            if (!sessionId || !transports[sessionId]) {
              // No valid session - return 405 to indicate this endpoint doesn't support
              // GET without a session (per MCP spec, server MAY return 405)
              res.writeHead(405, {
                "Content-Type": "text/plain",
                Allow: "POST, DELETE, OPTIONS",
              });
              res.end("Method not allowed");
              return;
            }

            // Valid session exists - handle SSE stream via transport
            const transport = transports[sessionId];
            await transport.handleRequest(req, res);
          } else if (req.method === "DELETE") {
            // Handle session termination
            const sessionId = req.headers["mcp-session-id"] as
              | string
              | undefined;
            if (!sessionId) {
              res.writeHead(400, { "Content-Type": "text/plain" });
              res.end("Missing session ID");
              return;
            }

            const success = cleanupSession(sessionId);
            if (!success) {
              res.writeHead(404, { "Content-Type": "text/plain" });
              res.end("Session not found");
              return;
            }

            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("Session terminated");
          } else {
            res.writeHead(405, { "Content-Type": "text/plain" });
            res.end("Method not allowed");
          }
        } else if (url === "/ping") {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("pong");
        } else if (url === "/sessions" && req.method === "GET") {
          // Return session information for monitoring
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(getSessionInfo(), null, 2));
        } else if (url === "/.well-known/mcp-config" && req.method === "GET") {
          // Return MCP configuration schema for Smithery and other clients
          const configSchema = {
            type: "object",
            description: "No configuration required",
            properties: {},
          };
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ configSchema }, null, 2));
        } else {
          res.writeHead(404);
          res.end("Not found");
        }

        // Log response time
        const duration = Date.now() - requestStart;
        console.error(
          `[${new Date().toISOString()}] ${req.method} ${url} - ${res.statusCode} (${duration}ms)`
        );
      } catch (error) {
        console.error("Error handling request:", error);
        if (!res.headersSent) {
          res.writeHead(500);
          res.end("Internal Server Error");
        }

        // Log error response time
        const duration = Date.now() - requestStart;
        console.error(
          `[${new Date().toISOString()}] ${req.method} ${url} - ERROR (${duration}ms)`
        );
      }
    });

    // Function to find available port and start server
    const findAvailablePort = async (
      startPort: number,
      maxAttempts = 10
    ): Promise<number> => {
      for (let port = startPort; port < startPort + maxAttempts; port++) {
        try {
          await new Promise<void>((resolve, reject) => {
            const testServer = createServer();
            testServer.once("error", (err: Error & { code?: string }) => {
              if (err.code === "EADDRINUSE") {
                reject(err);
              } else {
                reject(err);
              }
            });
            testServer.listen(port, () => {
              testServer.close(() => resolve());
            });
          });
          return port; // Port is available
        } catch (err: any) {
          if (err.code === "EADDRINUSE") {
            console.warn(`Port ${port} is in use, trying port ${port + 1}...`);
            continue;
          } else {
            throw err;
          }
        }
      }
      throw new Error(
        `No available ports found in range ${startPort}-${startPort + maxAttempts - 1}`
      );
    };

    // Find available port first, then start the server once
    const availablePort = await findAvailablePort(initialPort);
    actualPort = availablePort;

    await new Promise<void>((resolve, reject) => {
      httpServer.once("error", reject);
      httpServer.listen(availablePort, "0.0.0.0", () => {
        console.error(
          `Docfork MCP Server running on ${config.transport.toUpperCase()}:`
        );
        console.error(`  • HTTP endpoint: http://0.0.0.0:${actualPort}/mcp`);
        console.error(`  • Health check: http://0.0.0.0:${actualPort}/ping`);
        console.error(
          `  • Session info: http://0.0.0.0:${actualPort}/sessions`
        );
        console.error(
          `  • Well-known config: http://0.0.0.0:${actualPort}/.well-known/mcp-config`
        );
        resolve();
      });
    });
  } catch (error) {
    console.error("Failed to start HTTP server:", error);
    throw new Error(
      `Failed to start HTTP server: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
