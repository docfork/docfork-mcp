#!/usr/bin/env node

/**
 * Docfork MCP Server
 *
 * Updated to use modern Streamable HTTP transport with proper session management:
 * - Persistent session ID generation and storage for stateful connections
 * - Request body parsing for POST requests
 * - Proper CORS headers with Mcp-Session-Id exposure
 * - Flexible hostname support for deployment environments
 * - Support for DELETE requests for session termination
 * - Session cleanup and lifecycle management
 */

import { getServerConfig } from "./server/middleware.js";
import { startStdioServer } from "./transport/stdio.js";
import { startHttpServer } from "./transport/http.js";

async function main() {
  const config = getServerConfig();

  if (config.transport === "streamable-http") {
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
