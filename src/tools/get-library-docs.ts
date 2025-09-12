import { z } from "zod";
import { search } from "../api/search.js";
import { ToolConfig, ToolHandler } from "./types.js";

// Get DEFAULT_MINIMUM_TOKENS from environment variable or use default
let DEFAULT_MINIMUM_TOKENS = 10000;
if (process.env.DEFAULT_MINIMUM_TOKENS) {
  const parsedValue = parseInt(process.env.DEFAULT_MINIMUM_TOKENS, 10);
  if (!isNaN(parsedValue) && parsedValue > 0) {
    DEFAULT_MINIMUM_TOKENS = parsedValue;
  } else {
    console.warn(
      `Warning: Invalid DEFAULT_MINIMUM_TOKENS value provided in environment variable. Using default value of 10000`
    );
  }
}

export const getLibraryDocsToolConfig: ToolConfig = {
  name: "get-library-docs",
  title: "Get Library Documentation",
  description: `Retrieves up-to-date documentation and code examples for any library. This tool automatically searches for libraries and fetches their documentation with intelligent search capabilities.

Usage:
1. Provide either:
   - libraryId: Exact repository identifier (e.g., "shadcn-ui/ui", "vercel/next.js") for precise matching
   - libraryName: General library name (e.g., "shadcn UI components", "react") for broader search
2. Specify a topic to focus the documentation on (e.g., "sidebar", "button styling", "routing")

The tool will:
1. Use exact matching when libraryId is provided (shows alternatives if primary search fails)
2. Use hybrid search when libraryName is provided (focuses on best match)
3. Find the most relevant library and documentation sections
4. Return comprehensive documentation with code examples focused on the specified topic

Response includes:
- Primary library information (title, description, version, source type)
- Relevant documentation sections with code snippets
- Other matching libraries if applicable
- Properly formatted markdown with syntax-highlighted code blocks`,
  inputSchema: {
    libraryName: z
      .string()
      .optional()
      .describe(
        "Library name for hybrid search (e.g., 'shadcn UI components', 'react', 'next.js'). Use this for general library searches."
      ),
    libraryId: z
      .string()
      .optional()
      .describe(
        "Exact library identifier for precise matching (e.g., 'shadcn-ui/ui', 'vercel/next.js', 'facebook/react'). Use this when you know the specific library identifier."
      ),
    topic: z
      .string()
      .describe(
        "Topic to focus documentation on (e.g., 'sidebar', 'button styling', 'routing', 'authentication')"
      ),
    tokens: z
      .preprocess(
        (val) => (typeof val === "string" ? Number(val) : val),
        z.number()
      )
      .transform((val) =>
        val < DEFAULT_MINIMUM_TOKENS ? DEFAULT_MINIMUM_TOKENS : val
      )
      .optional()
      .describe(
        `Maximum number of tokens of documentation to retrieve (default: ${DEFAULT_MINIMUM_TOKENS}). Higher values provide more context but consume more tokens.`
      ),
  },
};

export const getLibraryDocsHandler: ToolHandler = async ({
  libraryName,
  libraryId,
  topic,
  tokens = DEFAULT_MINIMUM_TOKENS,
}) => {
  try {
    // Validate that at least one library identifier is provided
    if (!libraryName && !libraryId) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: Either 'libraryName' or 'libraryId' must be provided to search for documentation.",
          },
        ],
      };
    }

    // Validate that topic is provided and not empty
    // if (!topic || topic.trim() === "") {
    //   return {
    //     content: [
    //       {
    //         type: "text" as const,
    //         text: "Error: 'topic' parameter is required and cannot be empty. Please specify what you want to learn about (e.g., 'sidebar', 'button styling', 'routing').",
    //       },
    //     ],
    //   };
    // }

    // Prioritize libraryId over libraryName if both are provided
    const searchResponse = await search(topic, libraryId, libraryName, tokens);

    if (!searchResponse) {
      const identifierType = libraryId ? "library ID" : "library name";
      const identifier = libraryId || libraryName;
      return {
        content: [
          {
            type: "text" as const,
            text: `No libraries found matching ${identifierType} "${identifier}". Please try a different ${identifierType} or check the spelling.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: searchResponse,
        },
      ],
    };
  } catch (error) {
    // Enhanced error message handling
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null) {
      // Handle cases where error might be an object
      try {
        errorMessage = JSON.stringify(error);
      } catch {
        errorMessage = String(error);
      }
    } else {
      errorMessage = String(error);
    }

    const searchIdentifier = libraryId || libraryName || "unknown";
    const identifierType = libraryId ? "library ID" : "library name";

    // Log the error for debugging purposes
    console.error(
      `Error retrieving docs for ${identifierType} "${searchIdentifier}":`,
      error
    );

    // Provide contextual error message
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to retrieve documentation for ${identifierType} "${searchIdentifier}" with topic "${topic}": ${errorMessage}`,
        },
      ],
    };
  }
};
