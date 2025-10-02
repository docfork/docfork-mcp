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
import {
  createSearchToolConfig,
  searchDocsHandler,
  createReadToolConfig,
  readDocsHandler,
} from "../tools/index.js";

/**
 * Create a new MCP server instance
 */
export function createServerInstance(config: ServerConfig): Server {
  // Create tool configurations
  const searchDocsToolConfig = createSearchToolConfig();
  const readDocsToolConfig = createReadToolConfig();

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
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: searchDocsToolConfig.inputSchema.query.description,
            },
            tokens: {
              type: "string",
              description:
                searchDocsToolConfig.inputSchema.tokens?.description ||
                "Token budget control",
            },
            libraryId: {
              type: "string",
              description:
                searchDocsToolConfig.inputSchema.libraryId?.description ||
                "Optional library ID to filter search results to a specific library",
            },
          },
          required: ["query"],
        },
      },
      {
        name: readDocsToolConfig.name,
        description: readDocsToolConfig.description,
        inputSchema: {
          type: "object",
          properties: Object.keys(readDocsToolConfig.inputSchema).reduce(
            (acc, key) => {
              const schema = readDocsToolConfig.inputSchema[key];
              acc[key] = {
                type: "string",
                description: schema.description,
              };
              return acc;
            },
            {} as any
          ),
          required: Object.keys(readDocsToolConfig.inputSchema),
        },
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

  // Prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [
      {
        name: "search_docs",
        description:
          "Search for up-to-date documentation and code examples for any library or framework. Gets the latest docs straight from the source.",
        arguments: [
          {
            name: "query",
            description:
              "Your question or topic you want documentation for (e.g., 'Next.js routing', 'React hooks', 'Tailwind CSS setup')",
            required: true,
          },
        ],
      },
      {
        name: "read_url",
        description:
          "Read the content of a documentation URL as markdown/text. Pass URLs from 'search_docs'.",
        arguments: [
          {
            name: "url",
            description: "The URL of the webpage to read.",
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
      throw new McpError(
        ErrorCode.InvalidParams,
        "Missing required argument: query"
      );
    }

    if (name === "search_docs") {
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `${query}\n\nUse docfork to get the latest documentation and code examples.`,
            },
          },
        ],
      };
    }

    throw new McpError(ErrorCode.InvalidParams, `Unknown prompt: ${name}`);
  });

  return server;
}
