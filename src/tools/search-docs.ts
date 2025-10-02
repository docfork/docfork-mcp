import { z } from "zod";
import { searchDocs } from "../api/search-docs.js";
import { ToolConfig, ToolHandler, SearchSection } from "./types.js";
import { createParameterError, createErrorResponse } from "./utils.js";

// Tool configuration based on client type
type SearchToolConfig = {
  searchToolName: string;
  readToolName: string;
};

const OPENAI_TOOL_CONFIG: SearchToolConfig = {
  searchToolName: "search",
  readToolName: "fetch",
};

const DEFAULT_TOOL_CONFIG: SearchToolConfig = {
  searchToolName: "search-docs",
  readToolName: "read-docs",
};

// Function to get tool config based on client
function getToolConfig(mcpClient: string = "unknown"): SearchToolConfig {
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
      ? "Search for documents using semantic search. Returns a list of relevant search results."
      : `Search for documentation across the web, GitHub, and other sources. Use '${config.readToolName}' to read a URL.`,
    inputSchema: isOpenAI
      ? {
          query: z
            .string()
            .describe(
              "Search query string. Natural language queries work best for semantic search."
            ),
        }
      : {
          query: z
            .string()
            .describe(
              "Query for documentation. Include language/framework/library names."
            ),
          tokens: z
            .string()
            .optional()
            .describe(
              "Token budget control: 'dynamic' for system-determined optimal size, or number (100-10000) for hard limit"
            ),
        },
  };
}

// Transform section to OpenAI Deep Research shape
function toDeepResearchShape(section: SearchSection) {
  return {
    id: section.url,
    title: section.title,
    text: section.description,
    url: section.url,
  };
}

// search function
export async function doSearch(
  query: string,
  tokens?: string,
  mcpClient: string = "unknown"
) {
  const config = getToolConfig(mcpClient);

  if (!query || typeof query !== "string" || query.trim() === "") {
    return createParameterError(config.searchToolName, "query");
  }

  try {
    const data = await searchDocs(query, tokens);

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
              results: data.sections.map(toDeepResearchShape),
            }),
          },
        ],
      };
    } else {
      return {
        content: data.sections.map((section: SearchSection) => ({
          type: "text" as const,
          text: `title: ${section.title}\nurl: ${section.url}\ndescription: ${section.description}${section.score ? `\nscore: ${section.score}` : ""}`,
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
}) => {
  if (
    !args.query ||
    typeof args.query !== "string" ||
    args.query.trim() === ""
  ) {
    return createParameterError("search-docs", "query");
  }
  return doSearch(args.query, args.tokens, "unknown");
};
