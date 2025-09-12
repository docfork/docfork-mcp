import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  getLibraryDocsToolConfig,
  getLibraryDocsHandler,
} from "./get-library-docs.js";

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer) {
  // Register the get-library-docs tool
  server.registerTool(
    getLibraryDocsToolConfig.name,
    {
      title: getLibraryDocsToolConfig.title,
      description: getLibraryDocsToolConfig.description,
      inputSchema: getLibraryDocsToolConfig.inputSchema,
    },
    getLibraryDocsHandler
  );
}

// Export individual tool configs for external use if needed
export {
  getLibraryDocsToolConfig,
  getLibraryDocsHandler,
} from "./get-library-docs.js";
