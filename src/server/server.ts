import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ServerConfig } from "./middleware.js";
import { registerTools } from "../tools/index.js";

/**
 * Create a new MCP server instance with all tools registered
 */
export function createServerInstance(config: ServerConfig): McpServer {
  const server = new McpServer({
    name: config.name,
    description: config.description,
    version: config.version,
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  // Register all tools
  registerTools(server);

  return server;
}
