import { createServer, IncomingMessage, ServerResponse, Server } from "http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DocforkAuthConfig, resolveAuthConfig, authContext } from "./config.js";

const maxRequestBodyBytes = 1_000_000;

/**
 * Normalize a URL pathname for routing.
 * - collapse duplicate slashes
 * - drop trailing slash (except for "/")
 */
function normalizePathname(pathname: string): string {
  const collapsed = pathname.replace(/\/{2,}/g, "/");
  if (collapsed.length > 1 && collapsed.endsWith("/")) {
    return collapsed.slice(0, -1);
  }
  return collapsed;
}

/**
 * Treat any path that ends with "/mcp" as the MCP endpoint (e.g., "/mcp", "/mcp/", "/proxy/mcp").
 */
function isMcpEndpointPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return normalized === "/mcp" || normalized.endsWith("/mcp");
}

function isWellKnownMcpConfigPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return normalized === "/.well-known/mcp-config" || normalized.endsWith("/.well-known/mcp-config");
}

/**
 * detect client type from request body
 */
function detectClientType(requestBody: any): string {
  const clientInfo = requestBody?.params?.clientInfo;
  const payload: { clientInfo?: unknown } = {};

  // add client info to payload e.g. {"name":"inspector-client","version":"0.18.0"}
  if (clientInfo !== undefined) {
    payload.clientInfo = clientInfo;
  }
  if (!payload.clientInfo) {
    return "unknown";
  }

  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload.clientInfo ?? "unknown");
  }
}

function isOpenAIClient(requestBody: any, userAgent?: string): boolean {
  const clientInfo = requestBody?.params?.clientInfo;
  const name = clientInfo?.name?.toLowerCase() || "";
  const ua = userAgent?.toLowerCase() || "";
  return name.includes("openai") || ua.includes("openai");
}

/**
 * parse request body as json with size cap
 */
async function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    let seenBytes = 0;
    req.on("data", (chunk) => {
      const text = chunk.toString();
      seenBytes += Buffer.byteLength(text);
      if (seenBytes > maxRequestBodyBytes) {
        req.destroy();
        reject(new Error("Request body too large"));
        return;
      }
      body += text;
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
    const pathname = normalizePathname(url);

    // Set CORS headers for all responses (before any other processing)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, Accept-Encoding, MCP-Protocol-Version, Authorization, X-Docfork-Cabinet, DOCFORK_API_KEY, DOCFORK_CABINET, Docfork-Api-Key, Docfork-Cabinet, docfork_api_key, docfork_cabinet, Last-Event-ID, x-custom-auth-headers, X-Custom-Auth-Headers"
    );
    res.setHeader("Access-Control-Expose-Headers", "");
    res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

    // Handle preflight OPTIONS requests early
    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      if (isMcpEndpointPath(pathname)) {
        let authConfig: DocforkAuthConfig;
        try {
          authConfig = {
            ...extractAuthConfigFromRequest(req),
            clientIp: getClientIp(req),
            transport: "http",
          };
        } catch (error: any) {
          sendJsonError(res, 400, -32602, error.message || "Invalid configuration");
          return;
        }

        if (!req.headers.accept?.includes("text/event-stream")) {
          req.headers.accept = "application/json, text/event-stream";
        }

        let requestBody: any | undefined;
        if (req.method === "POST") {
          try {
            requestBody = await parseRequestBody(req);
          } catch (error: any) {
            if (error?.message === "Request body too large") {
              sendJsonError(res, 413, -32700, "Request body too large");
              return;
            }
            sendJsonError(res, 400, -32700, "Parse error");
            return;
          }
        }

        try {
          const clientType = detectClientType(requestBody);
          console.log(`Client info: ${clientType}`);

          const serverFactory = isOpenAIClient(requestBody, req.headers["user-agent"])
            ? openaiServerFactory
            : standardServerFactory;

          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true,
          });

          res.on("close", () => {
            transport.close();
          });

          await authContext.run(authConfig, async () => {
            const server = serverFactory();
            await server.connect(transport);
            if (requestBody !== undefined) {
              await transport.handleRequest(req, res, requestBody);
            } else {
              await transport.handleRequest(req, res);
            }
          });
        } catch (error) {
          console.error("Error handling MCP request:", error);
          if (!res.headersSent) {
            sendJsonError(res, 500, -32603, "Internal server error");
          }
        }
      } else if (pathname === "/ping") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("pong");
      } else if (isWellKnownMcpConfigPath(pathname) && req.method === "GET") {
        // Return MCP configuration schema for server discovery
        const configSchema = {
          type: "object",
          description: "No configuration required",
          properties: {},
        };
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ configSchema }, null, 2));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify(
            {
              error: "not_found",
              message: "Endpoint not found. Use /mcp for MCP protocol communication.",
            },
            null,
            2
          )
        );
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
