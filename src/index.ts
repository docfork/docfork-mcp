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

import { getServerConfig } from "./server/config.js";
import { startStdioServer } from "./transport/stdio.js";
import { startHttpServer } from "./transport/http.js";

async function main() {
  const config = getServerConfig();

  if (config.transport === "streamable-http" || config.transport === "sse") {
    await startHttpServer(config);
  } else {
    // Default to stdio transport
    await startStdioServer(config);
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
