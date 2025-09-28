#!/usr/bin/env node

/**
 * Docfork MCP Server
 *
 * A Model Context Protocol server that provides documentation search capabilities.
 * Supports both stdio and HTTP transports with proper session management.
 *
 * Features:
 * - Search for documentation libraries by name or ID
 * - Search within specific library documentation for detailed content
 * - Modern Streamable HTTP transport with session management
 * - Flexible configuration through environment variables
 */

import { getServerConfig } from "./server/middleware.js";
import { startStdioServer } from "./transport/stdio.js";
import { startHttpServer } from "./transport/http.js";

async function main() {
  const config = getServerConfig();

  // Determine transport type from config
  if (config.transport === "streamable-http") {
    await startHttpServer(config);
  } else {
    // Default to stdio transport for MCP client compatibility
    await startStdioServer(config);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.error("Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

main().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
