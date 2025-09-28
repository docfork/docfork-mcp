/**
 * Item returned by the searchDocs tool
 */
export interface SearchDocsItem {
  libraryId: string; // unique identifier for the library
  title: string;
  description: string;
}

/**
 * DeepResearch shape for OpenAI compatibility
 */
export interface DeepResearchShape {
  id: string;
  title: string;
  text: string;
  url: string;
}

/**
 * Tool configuration interface
 */
export interface ToolConfig {
  /** Tool name for registration */
  name: string;
  /** Human-readable title for the tool */
  title: string;
  /** Human-readable description of the tool */
  description: string;
  /** Zod schema object defining the expected parameters for the tool */
  inputSchema: Record<string, any>;
}

/**
 * Tool handler function type - matches MCP server expectations
 */
export type ToolHandler = (args: { [x: string]: any }) => Promise<{
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
  _meta?: Record<string, unknown>;
}>;
