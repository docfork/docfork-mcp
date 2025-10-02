import { z } from "zod";
import { readDocs } from "../api/read-docs.js";
import { ToolConfig, ToolHandler } from "./types.js";
import {
  createParameterError,
  createErrorResponse,
} from "./utils.js";

// Tool configuration based on client type
type ReadToolConfig = {
  searchToolName: string;
  readToolName: string;
};

const OPENAI_TOOL_CONFIG: ReadToolConfig = {
  searchToolName: "search",
  readToolName: "fetch",
};

const DEFAULT_TOOL_CONFIG: ReadToolConfig = {
  searchToolName: "search-docs",
  readToolName: "read-docs",
};

// Function to get tool config based on client
function getToolConfig(mcpClient: string = "unknown"): ReadToolConfig {
  return mcpClient === "openai-mcp" ? OPENAI_TOOL_CONFIG : DEFAULT_TOOL_CONFIG;
}

// Function to create read tool configuration
export function createReadToolConfig(
  mcpClient: string = "unknown"
): ToolConfig {
  const config = getToolConfig(mcpClient);
  const isOpenAI = mcpClient === "openai-mcp";

  return {
    name: config.readToolName,
    title: isOpenAI ? "Fetch Document" : "Read Documentation URL",
    description: isOpenAI
      ? "Retrieve complete document content by ID for detailed analysis and citation."
      : `Read the content of a documentation URL as markdown/text. Pass URLs from '${config.searchToolName}'.`,
    inputSchema: {
      [isOpenAI ? "id" : "url"]: z
        .string()
        .describe(
          isOpenAI
            ? "URL or unique identifier for the document to fetch."
            : "The URL of the webpage to read."
        ),
    },
  };
}

// Deep Research shape for OpenAI compatibility
type DeepResearchShape = {
  id: string;
  title: string;
  text: string;
  url: string;
  metadata?: any;
};

// read function
export async function doRead(url: string, mcpClient: string = "unknown") {
  const config = getToolConfig(mcpClient);

  if (!url || typeof url !== "string") {
    const paramName = mcpClient === "openai-mcp" ? "id" : "url";
    return createParameterError(config.readToolName, paramName);
  }

  try {
    const { text, library_identifier, version_info } =
      await readDocs(url);

    // Return different formats based on client type
    if (mcpClient === "openai-mcp") {
      const result: DeepResearchShape = {
        id: url,
        title: `Documentation from ${library_identifier} ${version_info}`,
        text,
        url,
        metadata: {
          source: "docfork",
          fetched_at: new Date().toISOString(),
        },
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result),
          },
        ],
      };
    } else {
      return {
        content: [{ type: "text" as const, text }],
      };
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return createErrorResponse(config.readToolName, msg);
  }
}

// Handler for backward compatibility
export const readDocsHandler: ToolHandler = async (args: {
  url?: string;
  id?: string;
}) => {
  const inputValue = args.id || args.url || "";
  return doRead(inputValue, "unknown");
};
