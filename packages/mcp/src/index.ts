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
  const server = new McpServer({
    name: "Docfork",
    version: "1.4.0",
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
        query: z.string().describe("Search query. Include language/framework names."),
        docforkIdentifier: z
          .string()
          .optional()
          .describe(
            "CRITICAL for targeted library searches: Library identifier in author/repo format (e.g., 'facebook/react', 'vercel/next.js'). Use this to search INSIDE a specific library's documentation for focused, accurate results. Extract from URLs in docfork_search_docs results and ALWAYS include in all subsequent searches about that library."
          ),
        tokens: z.string().optional().describe("Token budget: 'dynamic' or number (100-10000)"),
      },
    },
    async ({ query, tokens, docforkIdentifier }): Promise<CallToolResult> => {
      const authConfig = getAuthConfig();
      const response = await searchDocs(
        query as string,
        docforkIdentifier as string | undefined,
        tokens as string | undefined,
        authConfig
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
          .describe("Full URL to read. Use exact URLs from docfork_search_docs results."),
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
