import { z } from "zod";
import { searchDocs } from "../api/search-docs.js";
import {
  ToolConfig,
  ToolHandler,
  SearchDocsItem,
  DeepResearchShape,
} from "./types.js";

const OPENAI_MODE = process.env.DOCFORK_OPENAI_MODE === "1";

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

export const searchDocsHandler: ToolHandler = async ({ query }) => {
  if (!query || typeof query !== "string" || query.trim() === "") {
    return {
      content: [
        {
          type: "text",
          text: "[search-docs tool] Error: 'query' is required for doc search.",
        },
      ],
    };
  }

  try {
    const data = await searchDocs(query);

    if (typeof data === "string") {
      return { content: [{ type: "text", text: data }] };
    }

    if (!data || data.length === 0) {
      return {
        content: [
          { type: "text", text: "[search-docs tool] No results found" },
        ],
      };
    }

    if (OPENAI_MODE) {
      // OpenAI ChatGPT format: {"results": [{"id": "...", "title": "...", "url": "..."}]}
      const results = data.map((library) => ({
        id: library.libraryId,
        title: library.title,
        url: `https://docfork.com/library/${library.libraryId}`, // Provide a proper URL for citations
      }));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ results }),
          },
        ],
      };
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
    return {
      content: [{ type: "text", text: `[search-docs tool] ${msg}` }],
    };
  }
};
