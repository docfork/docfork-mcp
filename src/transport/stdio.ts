import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServerInstance } from "../server/server.js";
import { ServerConfig } from "../server/middleware.js";

/**
 * Start the server with stdio transport
 */
export async function startStdioServer(config: ServerConfig): Promise<void> {
  const server = createServerInstance(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Docfork MCP Server running on stdio");
}
