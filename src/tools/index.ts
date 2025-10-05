// Export individual tool configs and handlers
export { createSearchToolConfig, searchDocsHandler } from "./search-docs.js";
export { createReadToolConfig, readDocsHandler } from "./read-docs.js";
import { ToolConfigNames } from "./types.js";

// OpenAI MCP client uses shorter, simpler names
export const OPENAI_TOOL_CONFIG: ToolConfigNames = {
  searchToolName: "search",
  readToolName: "fetch",
};

// Default MCP client uses descriptive, namespaced names
export const DEFAULT_TOOL_CONFIG: ToolConfigNames = {
  searchToolName: "docfork_search_docs",
  readToolName: "docfork_read_url",
};
