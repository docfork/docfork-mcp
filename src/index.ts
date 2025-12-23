#!/usr/bin/env node

/**
 * Docfork MCP Server
 *
 * Main entry point supporting both stdio and HTTP transports.
 * Automatically detects OpenAI clients and routes to appropriate server.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  CallToolResult,
  GetPromptResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import { searchDocs, readUrl } from "./api/index.js";
import { z } from "zod";
import { getServerConfig } from "./config.js";
import { startHttpServer, startStdioServer } from "./server.js";
import { getServer as getOpenAIServer } from "./openai.js";

/**
 * Create and configure the standard MCP server
 */
export const getServer = () => {
  const server = new McpServer({
    name: "Docfork",
    version: "1.2.0",
    websiteUrl: "https://docfork.com",
    icons: [
      {
        src: "https://docfork.com/icon.svg",
        mimeType: "image/svg+xml",
      },
    ],
  });

  // register docfork search docs tool
  server.registerTool(
    "docfork_search_docs",
    {
      title: "Search Documentation",
      description:
        "Search documentation across GitHub repositories or the web. For targeted searches INSIDE a specific library's documentation, use the docforkIdentifier parameter (author/repo format). Extract from GitHub URLs (e.g., github.com/facebook/react → 'facebook/react') and include in ALL subsequent searches about that library for focused, accurate results.",
      inputSchema: {
        query: z
          .string()
          .describe("Search query. Include language/framework names."),
        docforkIdentifier: z
          .string()
          .optional()
          .describe(
            "CRITICAL for targeted library searches: Library identifier in author/repo format (e.g., 'facebook/react', 'vercel/next.js'). Use this to search INSIDE a specific library's documentation for focused, accurate results. Extract from URLs in docfork_search_docs results and ALWAYS include in all subsequent searches about that library."
          ),
        tokens: z
          .string()
          .optional()
          .describe("Token budget: 'dynamic' or number (100-10000)"),
      },
    },
    async ({ query, tokens, docforkIdentifier }): Promise<CallToolResult> => {
      const response = await searchDocs(
        query as string,
        docforkIdentifier as string | undefined,
        tokens as string | undefined
      );

      return {
        content: response.sections.map((section) => ({
          type: "text" as const,
          text: `title: ${section.title}\nurl: ${section.url}`,
        })),
      };
    }
  );

  // register docfork read url tool
  server.registerTool(
    "docfork_read_url",
    {
      title: "Read Documentation URL",
      description:
        "Fetches and returns the full content of a documentation page as markdown. This is ESSENTIAL for getting complete, detailed information after searching. Always use this to read URLs from docfork_search_docs results to get the actual documentation content.",
      inputSchema: {
        url: z
          .string()
          .describe(
            "Full URL to read. Use exact URLs from docfork_search_docs results."
          ),
      },
    },
    async (args): Promise<CallToolResult> => {
      const inputValue = args.url as string;
      const response = await readUrl(inputValue);
      return {
        content: [
          {
            type: "text" as const,
            text: response.text,
          },
        ],
      };
    }
  );

  // search docs resource
  server.registerResource(
    "search_docs",
    "docfork://tools/search_docs",
    {
      title: "Search Documentation Tool",
      description: "Guide for using the docfork_search_docs tool",
      mimeType: "text/markdown",
    },
    async (uri): Promise<ReadResourceResult> => {
      const toolExplanation = `# docfork_search_docs

Search documentation from GitHub or the web.

## Parameters
- **query** (required): Search query with language/framework names
- **docforkIdentifier** (critical for targeted searches): Library in author/repo format (e.g., 'facebook/react'). Use this to search INSIDE a specific library's documentation. Extract from URLs in search results.
- **tokens** (optional): 'dynamic' or number (100-10000)

## Example
\`\`\`
query: "React hooks useState"
docforkIdentifier: "facebook/react"  // For targeted search inside React docs
\`\`\`

Use \`docfork_read_url\` to read URLs from results.`;

      return {
        contents: [
          { uri: uri.href, mimeType: "text/markdown", text: toolExplanation },
        ],
      };
    }
  );

  // read url resource
  server.registerResource(
    "read_url",
    "docfork://tools/read_url",
    {
      title: "Read URL Tool",
      description: "Essential tool for reading full documentation content",
      mimeType: "text/markdown",
    },
    async (uri): Promise<ReadResourceResult> => {
      const toolExplanation = `# docfork_read_url

**Essential for getting complete documentation content.**

Fetches the full markdown content of documentation pages. Use this after docfork_search_docs to get detailed information.

## Parameters
- **url** (required): Full URL from docfork_search_docs results

## Example
\`\`\`
url: "https://react.dev/reference/react/useState"
\`\`\``;

      return {
        contents: [
          { uri: uri.href, mimeType: "text/markdown", text: toolExplanation },
        ],
      };
    }
  );

  // search docs prompt
  server.registerPrompt(
    "search_docs",
    {
      title: "Search Documentation",
      description: "Search documentation from GitHub or the web",
      argsSchema: {
        query: z.string().describe("Search query"),
        docforkIdentifier: z
          .string()
          .optional()
          .describe(
            "Library in author/repo format for targeted searches INSIDE that library's documentation (e.g., 'facebook/react')"
          ),
        tokens: z
          .string()
          .optional()
          .describe("Token budget: 'dynamic' or number"),
      },
    },
    async ({ query, docforkIdentifier, tokens }): Promise<GetPromptResult> => {
      let promptText = `${query}\n\nUse the 'docfork_search_docs' tool to search for documentation.`;
      if (tokens || docforkIdentifier) {
        promptText += `\n\nSearch parameters:`;
        if (tokens) promptText += `\n- Token budget: ${tokens}`;
        if (docforkIdentifier)
          promptText += `\n- Library filter: ${docforkIdentifier}`;
      }

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: promptText,
            },
          },
        ],
      };
    }
  );

  // read url prompt
  server.registerPrompt(
    "read_url",
    {
      title: "Read Documentation URL",
      description: "Fetch full documentation content from a URL",
      argsSchema: {
        url: z.string().describe("Documentation URL to read"),
      },
    },
    async ({ url }): Promise<GetPromptResult> => {
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Use the 'docfork_read_url' tool to read the documentation at: ${url as string}`,
            },
          },
        ],
      };
    }
  );

  // Error handler
  server.server.onerror = (error: any) => {
    console.error("MCP Server error:", error);
  };

  return server;
};

/**
 * Main function
 */
async function main() {
  const config = getServerConfig();

  if (config.transport === "stdio") {
    await startStdioServer(getServer);
  } else {
    // HTTP transport with client detection
    await startHttpServer(config.port, getServer, getOpenAIServer);
  }
}

// Handle graceful shutdown
const shutdown = (signal: string) => {
  console.error(`Received ${signal}, shutting down gracefully...`);
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
