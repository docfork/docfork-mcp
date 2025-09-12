/**
 * Tool configuration interface that matches our actual usage
 */
export interface ToolConfig {
  /** Intended for programmatic or logical use, but used as a display name in past specs or fallback */
  name: string;
  /**
   * Intended for UI and end-user contexts — optimized to be human-readable and easily understood,
   * even by those unfamiliar with domain-specific terminology.
   */
  title?: string;
  /**
   * A human-readable description of the tool.
   */
  description?: string;
  /**
   * Zod schema object defining the expected parameters for the tool.
   * This will be converted to JSON Schema when registering with MCP server.
   */
  inputSchema: Record<string, any>;
  /**
   * An optional JSON Schema object defining the structure of the tool's output returned in
   * the structuredContent field of a CallToolResult.
   */
  outputSchema?: {
    type: "object";
    properties?: Record<string, any>;
    required?: string[];
  };
  /**
   * Optional additional tool information.
   */
  annotations?: {
    /**
     * A human-readable title for the tool.
     */
    title?: string;
    /**
     * If true, the tool does not modify its environment.
     * Default: false
     */
    readOnlyHint?: boolean;
    /**
     * If true, the tool may perform destructive updates to its environment.
     * If false, the tool performs only additive updates.
     * Default: true
     */
    destructiveHint?: boolean;
    /**
     * If true, calling the tool repeatedly with the same arguments
     * will have no additional effect on its environment.
     * Default: false
     */
    idempotentHint?: boolean;
    /**
     * If true, this tool may interact with an "open world" of external
     * entities. If false, the tool's domain of interaction is closed.
     * Default: true
     */
    openWorldHint?: boolean;
  };
  /**
   * See MCP specification for notes on _meta usage.
   */
  _meta?: Record<string, unknown>;
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
