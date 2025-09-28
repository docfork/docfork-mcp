import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { ServerConfig } from "./middleware.js";
import { searchDocsToolConfig, searchDocsHandler, readDocsToolConfig, readDocsHandler } from "../tools/index.js";

/**
 * Create a new MCP server instance
 */
export function createServerInstance(config: ServerConfig): Server {
  const server = new Server(
    {
      name: config.name,
      version: config.version,
    },
    {
      capabilities: {
        tools: {},
        prompts: {
          listChanged: true,
        },
      },
    }
  );

  // Register request handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: searchDocsToolConfig.name,
        description: searchDocsToolConfig.description,
        inputSchema: searchDocsToolConfig.inputSchema,
      },
      {
        name: readDocsToolConfig.name,
        description: readDocsToolConfig.description,
        inputSchema: readDocsToolConfig.inputSchema,
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === searchDocsToolConfig.name) {
      return await searchDocsHandler(args || {});
    }

    if (name === readDocsToolConfig.name) {
      return await readDocsHandler(args || {});
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  // Error handler
  server.onerror = (error: any) => {
    console.error("MCP Server error:", error);
  };

  // Prompts: docfork equivalents of Ref's
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [
      {
        name: "search_docs",
        description:
          "A quick way to check technical documentation. Searches public documentation sources using Docfork.",
        arguments: [
          {
            name: "query",
            description:
              "The rest of your prompt or question you want informed by docs",
            required: true,
          },
        ],
      },
      {
        name: "my_docs",
        description:
          "Search through your private documentation, repos, and PDFs indexed by Docfork.",
        arguments: [
          {
            name: "query",
            description:
              "The rest of your prompt or question you want informed by your private docs",
            required: true,
          },
        ],
      },
    ],
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params as any;
    const query = args?.query as string | undefined;
    if (!query) {
      throw new McpError(ErrorCode.InvalidParams, "Missing required argument: query");
    }

    if (name === "search_docs") {
      return {
        messages: [
          {
            role: "user" as const,
            content: { type: "text" as const, text: `${query}\n\nSearch docfork with source=public` },
          },
        ],
      };
    }

    if (name === "my_docs") {
      return {
        messages: [
          {
            role: "user" as const,
            content: { type: "text" as const, text: `${query}\n\nSearch docfork with source=private` },
          },
        ],
      };
    }

    throw new McpError(ErrorCode.InvalidParams, `Unknown prompt: ${name}`);
  });

  return server;
}
