import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { searchDocsToolConfig, searchDocsHandler } from "./search-docs.js";
import { readDocsToolConfig, readDocsHandler } from "./read-docs.js";

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer) {
  // Register docfork-search-docs
  server.registerTool(
    searchDocsToolConfig.name,
    {
      title: searchDocsToolConfig.title,
      description: searchDocsToolConfig.description,
      inputSchema: searchDocsToolConfig.inputSchema,
    },
    searchDocsHandler
  );

  // Register docfork-read-docs
  server.registerTool(
    readDocsToolConfig.name,
    {
      title: readDocsToolConfig.title,
      description: readDocsToolConfig.description,
      inputSchema: readDocsToolConfig.inputSchema,
    },
    readDocsHandler
  );
}

// Export individual tool configs for external use if needed
export { searchDocsToolConfig, searchDocsHandler } from "./search-docs.js";
export { readDocsToolConfig, readDocsHandler } from "./read-docs.js";
