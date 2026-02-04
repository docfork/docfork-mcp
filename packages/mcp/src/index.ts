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
    version: "2.0.0",
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
    "query_docs",
    {
      title: "Query Documentation",
      description: `Required: library is required.

Use library to search, then lock to the exact repo:
- start with a best-guess library/package name (e.g., react, nextjs, supabase) or a GitHub URL
- once you identify the exact repo, always switch library to owner/repo (e.g., facebook/react) for follow-up queries
- if the user provides /owner/repo (Context7 style), remove the leading slash before calling

Examples:
- library: react -> library: facebook/react
- library: /vercel/next.js -> library: vercel/next.js

Selection guidance when multiple candidates appear:
- prefer exact name matches and official orgs over forks
- prefer canonical docs domains and upstream repositories

For ambiguous inputs, ask for clarification before proceeding (or pick the best match and state the assumption).

IMPORTANT: do not call this tool more than 3 times per question.`,
      inputSchema: {
        query: z
          .string()
          .describe(
            "The question or task. Be specific and include relevant details (language, framework, error message)."
          ),
        library: z
          .string()
          .describe(
            "Required. Preferred: exact owner/repo (e.g., facebook/react, vercel/next.js). If unknown, use a library/package name hint (e.g., react, nextjs) or a GitHub URL, then switch to exact owner/repo once identified. If you have /owner/repo, remove the leading slash."
          ),
        tokens: z
          .union([z.literal("dynamic"), z.number().int().min(100).max(10000), z.string()])
          .optional()
          .describe("Token budget: dynamic or a number (100-10000)."),
      },
    },
    async ({ query, tokens, library }): Promise<CallToolResult> => {
      const authConfig = getAuthConfig();
      const tokensParam =
        typeof tokens === "number" ? String(tokens) : (tokens as string | undefined);
      const response = await searchDocs(
        query as string,
        library as string,
        tokensParam,
        authConfig
      );

      return {
        content: [
          ...response.sections.map((section) => {
            return {
              type: "text" as const,
              text: `title: ${section.title}\nurl: ${section.url}\ncontent:\n${section.content}`,
            };
          }),
        ],
      };
    }
  );

  // register docfork fetch url tool
  server.registerTool(
    "fetch_url",
    {
      title: "Fetch URL",
      description: `Fetches and returns the full content of a URL as markdown.

Usage:
- Call query_docs first.
- Review content chunks in the results.
- Then call fetch_url for 1-2 of the most relevant URLs when chunks are incomplete or you need full context for exact API usage, configuration, or copy-pastable examples.

Notes:
- This is read-only and has no side effects.
- Use exact URLs from query_docs results. Deep links and anchors are allowed (example: https://github.com/vercel/next.js/blob/canary/examples/with-knex/README.md#L27-L35).

IMPORTANT: avoid reading many pages. Prefer the single most authoritative page.`,
      inputSchema: {
        url: z
          .string()
          .describe(
            "Full URL to fetch. Use exact URLs from query_docs results. Anchors are allowed (e.g., #L27-L35)."
          ),
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
