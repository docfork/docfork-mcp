// Unified tool configuration for consistent naming
export interface ToolConfigNames {
  searchToolName: string;
  readToolName: string;
}
/**
 * Section item in search results
 */
export interface SearchSection {
  url: string;
  title: string;
  description: string;
  score?: number;
}

/**
 * Response from the searchDocs API
 */
export interface SearchDocsResponse {
  sections: SearchSection[];
  truncated?: boolean;
}

/**
 * Response from the readDocs API
 */
export interface ReadDocsResponse {
  text: string;
  library_identifier: string;
  version_info: string;
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

/**
 * OpenAI Deep Research compatible result format
 * Used for both search results and document content
 */
export interface DeepResearchResult {
  id: string;
  title: string;
  text: string;
  url?: string;
  metadata?: {
    source?: string;
    fetched_at?: string;
    library_identifier?: string;
    version_info?: string;
    [key: string]: any;
  };
}

/**
 * Common error response format
 */
export interface ToolErrorResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
}
