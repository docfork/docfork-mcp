import { createServer, IncomingMessage, ServerResponse, Server } from "http";
import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { DocforkAuthConfig, resolveAuthConfig, authContext } from "./config.js";

// Map to store transports by session ID
const transports: Record<string, StreamableHTTPServerTransport> = {};

/**
 * Detect client type from initialization request
 */
function detectClientType(requestBody: any, userAgent?: string): string {
  const clientInfo = requestBody?.params?.clientInfo;
  const name = clientInfo?.name?.toLowerCase() || "";
  const ua = userAgent?.toLowerCase() || "";
  return name.includes("openai") || ua.includes("openai") ? "openai-mcp" : "unknown";
}

/**
 * Parse request body as JSON
 */
async function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON in request body"));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Get information about active sessions (for debugging/monitoring)
 */
function getSessionInfo() {
  return {
    activeSessions: Object.keys(transports).length,
    sessionIds: Object.keys(transports),
  };
}

/**
 * Send JSON-RPC error response
 */
function sendJsonError(
  res: ServerResponse,
  code: number,
  errorCode: number,
  message: string
): void {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: errorCode, message },
      id: null,
    })
  );
}

/**
 * Extract client IP address from request headers.
 * Handles X-Forwarded-For header for proxied requests.
 */
function getClientIp(req: IncomingMessage): string | undefined {
  const forwardedFor = req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"];

  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const ipList = ips.split(",").map((ip) => ip.trim());

    // Filter out private IPs to get real client IP
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
    // If all IPs are private, return first one
    return ipList[0]?.replace(/^::ffff:/, "");
  }

  // Fallback to socket remote address
  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress.replace(/^::ffff:/, "");
  }
  return undefined;
}

/**
 * Extract auth headers from HTTP request and resolve auth config
 */
function extractAuthConfigFromRequest(req: IncomingMessage): DocforkAuthConfig {
  // convert IncomingMessage headers to Record format for resolveAuthConfig
  const headers: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    headers[key] = value;
  }
  return resolveAuthConfig(headers);
}

/**
 * Handle MCP POST requests
 */
async function handleMcpPost(
  req: IncomingMessage,
  res: ServerResponse,
  standardServerFactory: () => McpServer,
  openaiServerFactory: () => McpServer
): Promise<void> {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  // Extract and resolve auth config from request headers
  let authConfig: DocforkAuthConfig;
  try {
    authConfig = {
      ...extractAuthConfigFromRequest(req),
      clientIp: getClientIp(req),
      transport: "http",
    };
  } catch (error: any) {
    // validation error (e.g., cabinet without api key)
    sendJsonError(res, 400, -32602, error.message || "Invalid configuration");
    return;
  }

  // Ensure Accept header includes required content types for MCP
  if (!req.headers.accept?.includes("text/event-stream")) {
    req.headers.accept = "application/json, text/event-stream";
  }

  // Parse request body
  let requestBody: any;
  try {
    requestBody = await parseRequestBody(req);
  } catch {
    sendJsonError(res, 400, -32700, "Parse error");
    return;
  }

  try {
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(requestBody)) {
      // new initialization request - create new session
      const newSessionId = randomUUID();

      // Detect client type and select appropriate server factory
      const clientType = detectClientType(requestBody, req.headers["user-agent"]);
      console.log(`Detected client type: ${clientType}`);

      const serverFactory =
        clientType === "openai-mcp" ? openaiServerFactory : standardServerFactory;

      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
        onsessioninitialized: (sid) => {
          console.log(`Session initialized with ID: ${sid}`);
          transports[sid] = transport;
        },
      });

      // set up onclose handler to clean up transport when closed
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          console.log(`Transport closed for session ${sid}, removing from transports map`);
          delete transports[sid];
        }
      };

      // Run within AsyncLocalStorage context so auth flows automatically to tools
      await authContext.run(authConfig, async () => {
        // connect the transport to the MCP server BEFORE handling the request
        // so responses can flow back through the same transport
        const server = serverFactory();
        await server.connect(transport);
        await transport.handleRequest(req, res, requestBody);
      });
      return;
    } else {
      // invalid request - no session ID and not an initialize request
      sendJsonError(
        res,
        400,
        -32000,
        sessionId ? "Session not found" : "Bad Request: No valid session ID provided"
      );
      return;
    }

    // Handle request with existing transport - no need to reconnect
    // the existing transport is already connected to the server
    // Run within AsyncLocalStorage context for this request
    await authContext.run(authConfig, async () => {
      await transport.handleRequest(req, res, requestBody);
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      sendJsonError(res, 500, -32603, "Internal server error");
    }
  }
}

/**
 * Handle MCP GET requests for SSE streams
 */
async function handleMcpGet(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !transports[sessionId]) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Invalid or missing session ID");
    return;
  }

  // check for Last-Event-ID header for resumability
  const lastEventId = req.headers["last-event-id"] as string | undefined;
  if (lastEventId) {
    console.log(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
  } else {
    console.log(`Establishing new SSE stream for session ${sessionId}`);
  }

  await transports[sessionId].handleRequest(req, res);
}

/**
 * Handle MCP DELETE requests for session termination
 */
async function handleMcpDelete(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (!sessionId || !transports[sessionId]) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Invalid or missing session ID");
    return;
  }

  console.log(`Received session termination request for session ${sessionId}`);

  try {
    await transports[sessionId].handleRequest(req, res);
  } catch (error) {
    console.error("Error handling session termination:", error);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error processing session termination");
    }
  }
}

/**
 * Start the HTTP server with the given server factories
 * automatically finds an available port if the requested port is in use
 */
export async function startHttpServer(
  port: number,
  standardServerFactory: () => McpServer,
  openaiServerFactory: () => McpServer
): Promise<void> {
  const maxAttempts = 10;
  let finalPort = port;
  let httpServer: Server | null = null;

  // create request handler function (reused for all port attempts)
  const requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
    const url = (req.url || "/").split("?")[0];

    // Set CORS headers for all responses (before any other processing)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, Accept-Encoding, MCP-Session-Id, mcp-session-id, MCP-Protocol-Version, Authorization, X-Docfork-Cabinet, DOCFORK_API_KEY, DOCFORK_CABINET, Docfork-Api-Key, Docfork-Cabinet, docfork_api_key, docfork_cabinet, Last-Event-ID, x-custom-auth-headers, X-Custom-Auth-Headers"
    );
    res.setHeader("Access-Control-Expose-Headers", "MCP-Session-Id, mcp-session-id");
    res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

    // Handle preflight OPTIONS requests early
    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      if (url === "/mcp") {
        if (req.method === "POST") {
          await handleMcpPost(req, res, standardServerFactory, openaiServerFactory);
        } else if (req.method === "GET") {
          await handleMcpGet(req, res);
        } else if (req.method === "DELETE") {
          await handleMcpDelete(req, res);
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
        // Return MCP configuration schema for server discovery
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
    } catch (error) {
      console.error("Error handling request:", error);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    }
  };

  // try to find an available port
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const testPort = port + attempt;
    httpServer = createServer(requestHandler);

    try {
      await new Promise<void>((resolve, reject) => {
        httpServer!.once("error", (err: NodeJS.ErrnoException) => {
          if (err.code === "EADDRINUSE") {
            // port is in use, try next port
            reject(new Error("EADDRINUSE"));
          } else {
            // other error, reject immediately
            reject(err);
          }
        });
        httpServer!.listen(testPort, () => {
          finalPort = testPort;
          if (finalPort !== port) {
            console.error(`Port ${port} is already in use, using port ${finalPort} instead`);
          }
          console.error(`Docfork MCP Server running on HTTP:`);
          console.error(`  • HTTP endpoint: http://localhost:${finalPort}/mcp`);
          console.error(`  • Health check: http://localhost:${finalPort}/ping`);
          console.error(`  • Session info: http://localhost:${finalPort}/sessions`);
          resolve();
        });
      });

      // successfully started on this port
      break;
    } catch (error: any) {
      if (error.message === "EADDRINUSE" && attempt < maxAttempts - 1) {
        // close the server and try next port
        httpServer?.close();
        httpServer = null;
        continue;
      } else {
        // unexpected error or ran out of attempts
        httpServer?.close();
        throw error;
      }
    }
  }

  if (!httpServer) {
    throw new Error(`Unable to find available port in range ${port}-${port + maxAttempts - 1}`);
  }

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log("Shutting down server...");
    for (const sid in transports) {
      try {
        const transport = transports[sid];
        if (transport?.close) {
          await transport.close();
        }
        delete transports[sid];
      } catch (error) {
        console.error(`Error closing transport for session ${sid}:`, error);
      }
    }
    console.log("Server shutdown complete");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

/**
 * Start stdio transport with provided server factory
 */
export async function startStdioServer(serverFactory: () => McpServer): Promise<void> {
  const server = serverFactory();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Docfork MCP Server running on stdio");
}
