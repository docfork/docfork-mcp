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
      if (url === "/mcp") {
        if (req.method === "POST") {
          // Parse request body for POST requests
          let requestBody = {};
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

          // Check for existing session ID
          const sessionId = req.headers["mcp-session-id"] as string | undefined;
          let transport: StreamableHTTPServerTransport;

          if (sessionId && transports[sessionId]) {
            // Reuse existing transport and server
            transport = transports[sessionId];
          } else if (!sessionId && isInitializeRequest(requestBody)) {
            // New initialization request - create new session
            const newSessionId = randomUUID();

            transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => newSessionId,
            });

            // Create new server instance
            const server = createServerInstance(config);

            // Store session data
            transports[newSessionId] = transport;
            servers[newSessionId] = server;
            sessionClientInfo[newSessionId] = {
              name: (requestBody as any)?.params?.clientInfo?.name,
              userAgent: req.headers["user-agent"],
            };

            // Clean up session when transport closes
            transport.onclose = () => {
              delete transports[newSessionId];
              delete servers[newSessionId];
              delete sessionClientInfo[newSessionId];
            };

            // Connect server to transport
            await server.connect(transport);
          } else {
            // Invalid request - missing session ID or not an initialize request
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
          await transport.handleRequest(req, res, requestBody);
        } else if (req.method === "DELETE") {
          // Handle session termination
          const sessionId = req.headers["mcp-session-id"] as string | undefined;
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

  // Function to find available port and start server
  const findAvailablePort = async (
    startPort: number,
    maxAttempts = 10
  ): Promise<number> => {
    for (let port = startPort; port < startPort + maxAttempts; port++) {
      try {
        await new Promise<void>((resolve, reject) => {
          const testServer = createServer();
          testServer.once("error", (err: NodeJS.ErrnoException) => {
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
    httpServer.listen(availablePort, () => {
      console.error(
        `Docfork MCP Server running on ${config.transport.toUpperCase()}:`
      );
      console.error(`  • HTTP endpoint: http://localhost:${actualPort}/mcp`);
      console.error(`  • Health check: http://localhost:${actualPort}/ping`);
      console.error(
        `  • Session info: http://localhost:${actualPort}/sessions`
      );
      resolve();
    });
  });
}
