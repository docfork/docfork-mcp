import {
  ToolErrorResponse,
  OpenAISearchResult,
  OpenAIDocumentResult,
} from "./types.js";

/**
 * Check if OpenAI mode is enabled
 */
export function isOpenAIMode(): boolean {
  return process.env.DOCFORK_OPENAI_MODE === "1";
}

/**
 * Validate OpenAI mode configuration
 */
export function validateOpenAIMode(): void {
  const mode = process.env.DOCFORK_OPENAI_MODE;
  if (mode && mode !== "1" && mode !== "0") {
    console.warn(
      `Invalid DOCFORK_OPENAI_MODE value: ${mode}. Expected "1" or "0".`
    );
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  toolName: string,
  message: string
): ToolErrorResponse {
  return {
    content: [
      {
        type: "text",
        text: `[${toolName} tool] ${message}`,
      },
    ],
    isError: true,
  };
}

/**
 * Create a parameter validation error
 */
export function createParameterError(
  toolName: string,
  paramName: string
): ToolErrorResponse {
  return createErrorResponse(toolName, `Error: '${paramName}' is required.`);
}

/**
 * Create OpenAI search results response
 */
export function createOpenAISearchResponse(results: OpenAISearchResult[]): {
  content: Array<{ type: "text"; text: string }>;
} {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ results }),
      },
    ],
  };
}

/**
 * Create OpenAI document response
 */
export function createOpenAIDocumentResponse(result: OpenAIDocumentResult): {
  content: Array<{ type: "text"; text: string }>;
} {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result),
      },
    ],
  };
}