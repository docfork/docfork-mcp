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
  name: "docfork-search-docs",
  title: "Search Documentation",
  description:
    "Search for documentation across the web, GitHub, and other sources. Use 'docfork-read-docs' to read a URL.",
  inputSchema: {
    query: z
      .string()
      .describe(
        "Query for documentation. Include language/framework/library names."
      ),
  },
};

export const searchDocsHandler: ToolHandler = async ({ query }) => {
  if (!query || typeof query !== "string" || query.trim() === "") {
    return {
      content: [
        { type: "text", text: "Error: 'query' is required for doc search." },
      ],
    };
  }

  try {
    const data = await searchDocs(query);

    if (typeof data === "string") {
      return { content: [{ type: "text", text: data }] };
    }

    const itemsTyped = data as Array<SearchDocsItem>;

    if (!itemsTyped || itemsTyped.length === 0) {
      return { content: [{ type: "text", text: "No results found" }] };
    }

    if (OPENAI_MODE) {
      const shaped: DeepResearchShape[] = itemsTyped.map((library) => ({
        id: library.libraryId,
        title: library.title,
        text: library.description,
        url: library.libraryId,
      }));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(shaped),
          },
        ],
      };
    }

    // Non-OpenAI: one text part per library with key fields.
    return {
      content: itemsTyped.map((library) => ({
        type: "text" as const,
        text: `libraryId: ${library.libraryId}\n title: ${library.title}\n description: ${library.description}`,
      })),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      content: [
        { type: "text", text: `Error during documentation search: ${msg}` },
      ],
    };
  }
};
