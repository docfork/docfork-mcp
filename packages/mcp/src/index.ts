#!/usr/bin/env node

/**
 * Docfork MCP Server
 *
 * Main entry point supporting both stdio and HTTP transports.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { searchDocs, readUrl } from "./api/index.js";
import { z } from "zod";
import {
  getServerConfig,
  resolveAuthConfig,
  setGlobalAuthConfig,
  getAuthConfig,
} from "./config.js";
import { startHttpServer, startStdioServer } from "./transport.js";

/**
 * Create and configure the standard MCP server
 */
export const getServer = () => {
  const server = new McpServer(
    {
      name: "Docfork",
      version: "2.0.0",
      websiteUrl: "https://docfork.com",
      icons: [
        {
          src: "https://docfork.com/icon.svg",
          mimeType: "image/svg+xml",
        },
      ],
    },
    {
      instructions:
        "Use query_docs to search library documentation and fetch_url to read full pages from the results.",
    }
  );

  // register docfork search docs tool
  server.registerTool(
    "query_docs",
    {
      title: "Query Documentation",
      description: `Searches documentation for a library and returns content chunks with titles, URLs, and summaries. The library parameter is required.

The library parameter accepts two formats:
- A short name or keyword when unsure of the exact repository
- An exact owner/repo identifier once known

Always prefer the exact owner/repo form for follow-up queries. If the user supplies a GitHub URL, extract the owner/repo from it.

Selection guidance when multiple candidates appear:
- prefer exact name matches and official orgs over forks
- prefer canonical docs domains and upstream repositories

For ambiguous inputs, pick the best match and state the assumption.

Do not call this tool more than 3 times per question. If you cannot find what you need after 3 calls, use the best result you have.`,
      inputSchema: {
        query: z
          .string()
          .describe(
            "The question or task. Be specific and include relevant details. Good: 'How to set up server-side rendering in Next.js' or 'Zod schema validation for nested objects'. Bad: 'rendering' or 'validation'."
          ),
        library: z
          .string()
          .describe(
            "Required. Exact owner/repo when known (e.g., facebook/react, vercel/next.js, supabase/supabase, TanStack/query). Otherwise a short library name or keyword (e.g., react, nextjs)."
          ),
        tokens: z
          .union([z.literal("dynamic"), z.number().int().min(100).max(10000), z.string()])
          .optional()
          .describe("Token budget: dynamic or a number (100-10000)."),
      },
      annotations: {
        readOnlyHint: true,
      },
    },
    async ({ query, tokens, library }): Promise<CallToolResult> => {
      const authConfig = getAuthConfig();
      const tokensParam =
        typeof tokens === "number" ? String(tokens) : (tokens as string | undefined);
      // normalize: strip leading slash from owner/repo (e.g., /vercel/next.js -> vercel/next.js)
      const normalizedLibrary = (library as string).replace(/^\//, "");
      const response = await searchDocs(
        query as string,
        normalizedLibrary,
        tokensParam,
        authConfig
      );

      const resultHeader = [
        "Results below. Each result includes:",
        "- title: Section heading",
        "- description: Brief summary",
        "- url: Chunk URL. Use with fetch_url for full content, or navigate to a parent path for a table of contents.",
        "",
        "Select the most relevant result for the user's question. Use fetch_url if you need more context.",
        "------",
      ].join("\n");

      return {
        content: [
          {
            type: "text" as const,
            text: resultHeader,
          },
          ...response.sections.map((section) => ({
            type: "text" as const,
            text: `title: ${section.title}\ndescription: ${section.description}\nurl: ${section.url}`,
          })),
        ],
      };
    }
  );

  // register docfork fetch url tool
  server.registerTool(
    "fetch_url",
    {
      title: "Fetch URL",
      description: `Fetches a URL and returns its content as markdown. Only accepts URLs from query_docs results or derived from them.

- Pass a URL from query_docs results to retrieve the full content of that chunk.
- Navigate to a broader path (drop anchors or trim to a parent directory) to get a table of contents with chunk previews.

Do not use with arbitrary URLs. Prefer fewer, highly relevant fetches over many broad ones.`,
      inputSchema: {
        url: z
          .string()
          .describe("Full URL from query_docs results. Anchors and deep links are supported."),
      },
      annotations: {
        readOnlyHint: true,
      },
    },
    async (args): Promise<CallToolResult> => {
      const inputValue = args.url as string;
      const authConfig = getAuthConfig();
      const response = await readUrl(inputValue, authConfig);
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
    // resolve auth config from CLI args and env vars only (no headers for stdio)
    try {
      const authConfig = resolveAuthConfig();
      setGlobalAuthConfig(authConfig);
    } catch (error: any) {
      console.error(`Configuration error: ${error.message}`);
      process.exit(1);
    }
    await startStdioServer(getServer);
  } else {
    // HTTP transport with client detection
    // auth config will be resolved per-request from headers and stored in AsyncLocalStorage
    await startHttpServer(config.port, getServer);
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
