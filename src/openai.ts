import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { searchDocs, readUrl } from "./api/index.js";
import { z } from "zod";
import { getAuthConfig } from "./config.js";

/**
 * Format search section to OpenAI Deep Research format
 */
function formatSearchResult(section: { url: string; title: string; content: string }): {
  id: string;
  title: string;
  text: string;
  url: string;
} {
  // Create a proper text snippet (200 chars as per OpenAI examples)
  const textSnippet =
    section.content.length > 200 ? section.content.slice(0, 200) + "..." : section.content;

  return {
    id: section.url,
    title: section.title,
    text: textSnippet,
    url: section.url,
  };
}

/**
 * Create and configure the OpenAI-compatible MCP server
 */
export const getServer = () => {
  const server = new McpServer({
    name: "Docfork",
    version: "1.3.4",
    websiteUrl: "https://docfork.com",
    icons: [
      {
        src: "https://docfork.com/icon.svg",
        mimeType: "image/svg+xml",
      },
    ],
  });

  // Register search tool (OpenAI Deep Research format)
  server.registerTool(
    "search",
    {
      title: "Search Documentation",
      description:
        "Search for documents using semantic search across web documentation and GitHub. Returns a list of relevant search results.",
      inputSchema: {
        query: z
          .string()
          .describe(
            "Search query string. Natural language queries work best. Include programming language and framework names for better results."
          ),
      },
    },
    async ({ query }): Promise<CallToolResult> => {
      if (!query || typeof query !== "string" || query.trim() === "") {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ results: [] }),
            },
          ],
        };
      }

      try {
        const authConfig = getAuthConfig();
        const response = await searchDocs(
          query as string,
          undefined, // docforkIdentifier
          undefined, // tokens
          authConfig
        );

        if (!response || !response.sections || response.sections.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ results: [] }),
              },
            ],
          };
        }

        // Return OpenAI Deep Research format: single text content with JSON-wrapped results
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                results: response.sections.map(formatSearchResult),
              }),
            },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: msg,
                results: [],
              }),
            },
          ],
        };
      }
    }
  );

  // Register fetch tool (OpenAI Deep Research format)
  server.registerTool(
    "fetch",
    {
      title: "Fetch Document",
      description: "Retrieve complete document content by ID for detailed analysis and citation.",
      inputSchema: {
        id: z.string().describe("URL or unique identifier for the document to fetch."),
      },
    },
    async (args): Promise<CallToolResult> => {
      const id = (args as any).id as string;

      if (!id || typeof id !== "string") {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "Document ID is required",
              }),
            },
          ],
        };
      }

      try {
        const authConfig = getAuthConfig();
        const response = await readUrl(id, authConfig);

        // Return OpenAI Deep Research format: single text content with JSON-wrapped document
        const result = {
          id: id,
          title: `Documentation${response.library_identifier ? ` from ${response.library_identifier}` : ""}${response.version_info ? ` ${response.version_info}` : ""}`,
          text: response.text,
          url: id,
          metadata: {
            source: "docfork",
            fetched_at: new Date().toISOString(),
            ...(response.library_identifier && {
              library_identifier: response.library_identifier,
            }),
            ...(response.version_info && {
              version_info: response.version_info,
            }),
          },
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: msg,
              }),
            },
          ],
        };
      }
    }
  );

  // Error handler
  server.server.onerror = (error: any) => {
    console.error("MCP Server error:", error);
  };

  return server;
};
