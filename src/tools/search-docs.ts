import { z } from "zod";
import { searchDocs } from "../api/search-docs.js";
import { ToolConfig, ToolHandler, OpenAISearchResult } from "./types.js";
import {
  isOpenAIMode,
  validateOpenAIMode,
  createParameterError,
  createErrorResponse,
  createOpenAISearchResponse,
  generateLibraryUrl,
} from "./utils.js";

// Validate environment on module load
validateOpenAIMode();

const OPENAI_MODE = isOpenAIMode();

export const searchDocsToolConfig: ToolConfig = {
  name: OPENAI_MODE ? "search" : "docfork-search-docs",
  title: "Search Documentation",
  description: OPENAI_MODE
    ? "Search for documents using semantic search. Returns a list of relevant search results."
    : "Search for documentation across the web, GitHub, and other sources. Use 'docfork-read-docs' to read a URL.",
  inputSchema: {
    query: z
      .string()
      .describe(
        OPENAI_MODE
          ? "Search query string. Natural language queries work best for semantic search."
          : "Query for documentation. Include language/framework/library names."
      ),
  },
};

export const searchDocsHandler: ToolHandler = async (args: {
  query?: string;
}) => {
  const query = args.query;
  if (!query || typeof query !== "string" || query.trim() === "") {
    return createParameterError(
      OPENAI_MODE ? "search" : "search-docs",
      "query"
    );
  }

  try {
    const data = await searchDocs(query);

    if (typeof data === "string") {
      return { content: [{ type: "text", text: data }] };
    }

    if (!data || data.length === 0) {
      return createErrorResponse(
        OPENAI_MODE ? "search" : "search-docs",
        "No results found"
      );
    }

    if (OPENAI_MODE) {
      // OpenAI format:
      const results: OpenAISearchResult[] = data.map((library) => ({
        id: library.libraryId,
        title: library.title,
        text: library.description, // Use description as the text snippet
        url: generateLibraryUrl(library.libraryId), // Use consistent URL generation
      }));
      return createOpenAISearchResponse(results);
    }

    // Standard format: one text part per library with key fields
    return {
      content: data.map((library) => ({
        type: "text" as const,
        text: `libraryId: ${library.libraryId}\ntitle: ${library.title}\ndescription: ${library.description}`,
      })),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return createErrorResponse(OPENAI_MODE ? "search" : "search-docs", msg);
  }
};
