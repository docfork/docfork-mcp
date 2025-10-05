import { z } from "zod";
import { searchDocs } from "../api/search-docs.js";
import {
  ToolConfig,
  ToolHandler,
  SearchSection,
  ToolConfigNames,
  DeepResearchResult,
} from "./types.js";
import { createParameterError, createErrorResponse } from "./utils.js";
import { DEFAULT_TOOL_CONFIG, OPENAI_TOOL_CONFIG } from "./index.js";

// Function to get tool config based on client
function getToolConfig(mcpClient: string = "unknown"): ToolConfigNames {
  return mcpClient === "openai-mcp" ? OPENAI_TOOL_CONFIG : DEFAULT_TOOL_CONFIG;
}

// Function to create search tool configuration
export function createSearchToolConfig(
  mcpClient: string = "unknown"
): ToolConfig {
  const config = getToolConfig(mcpClient);
  const isOpenAI = mcpClient === "openai-mcp";

  return {
    name: config.searchToolName,
    title: "Search Documentation",
    description: isOpenAI
      ? "Search for documents using semantic search across web documentation and GitHub. Returns a list of relevant search results."
      : `Search for documentation from GitHub or the web. Include programming language and framework names for best results. If a library ID appears in chat inside a URL, use that library ID for future searches to filter results to that specific library. Use '${config.readToolName}' to read a URL.`,
    inputSchema: isOpenAI
      ? {
          query: z
            .string()
            .describe(
              "Search query string. Natural language queries work best. Include programming language and framework names for better results."
            ),
        }
      : {
          query: z
            .string()
            .describe(
              "Query for documentation. Include programming language and framework names for best results."
            ),
          tokens: z
            .string()
            .optional()
            .describe(
              "Token budget control: 'dynamic' for system-determined optimal size, or number (100-10000) for hard limit"
            ),
          libraryId: z
            .string()
            .optional()
            .describe(
              "Optional library ID to filter search results to a specific library"
            ),
        },
  };
}

// Transform section to Deep Research format
function toDeepResearchResult(section: SearchSection): DeepResearchResult {
  return {
    id: section.url,
    title: section.title,
    text: section.content.slice(0, 100),
    url: section.url,
  };
}

// search function
export async function doSearch(
  query: string,
  tokens?: string,
  libraryId?: string,
  mcpClient: string = "unknown"
) {
  const config = getToolConfig(mcpClient);

  if (!query || typeof query !== "string" || query.trim() === "") {
    return createParameterError(config.searchToolName, "query");
  }

  try {
    const data = await searchDocs(query, tokens, libraryId);

    if (typeof data === "string") {
      return { content: [{ type: "text" as const, text: data }] };
    }

    if (!data || !data.sections || data.sections.length === 0) {
      return {
        content: [{ type: "text" as const, text: "No results found" }],
      };
    }

    // Return different formats based on client type
    if (mcpClient === "openai-mcp") {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              results: data.sections.map(toDeepResearchResult),
            }),
          },
        ],
      };
    } else {
      return {
        content: data.sections.map((section: SearchSection) => ({
          type: "text" as const,
          text: `title: ${section.title}\nurl: ${section.url}`,
        })),
      };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return createErrorResponse(config.searchToolName, msg);
  }
}

// Handler for backward compatibility
export const searchDocsHandler: ToolHandler = async (args: {
  query?: string;
  tokens?: string;
  libraryId?: string;
}) => {
  if (
    !args.query ||
    typeof args.query !== "string" ||
    args.query.trim() === ""
  ) {
    return createParameterError("search-docs", "query");
  }
  return doSearch(args.query, args.tokens, args.libraryId, "unknown");
};
