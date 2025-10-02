import { z } from "zod";
import { readDocs } from "../api/read-docs.js";
import { ToolConfig, ToolHandler, OpenAIDocumentResult } from "./types.js";
import {
  isOpenAIMode,
  validateOpenAIMode,
  createParameterError,
  createErrorResponse,
  createOpenAIDocumentResponse,
  extractHostname,
} from "./utils.js";

// Validate environment on module load
validateOpenAIMode();

const OPENAI_MODE = isOpenAIMode();

export const readDocsToolConfig: ToolConfig = {
  name: OPENAI_MODE ? "fetch" : "docfork-read-docs",
  title: OPENAI_MODE ? "Fetch Document" : "Read Documentation URL",
  description: OPENAI_MODE
    ? "Retrieve complete document content by ID for detailed analysis and citation."
    : "Read the content of a documentation URL as markdown/text. Pass URLs from 'docfork-search-docs'.",
  inputSchema: OPENAI_MODE
    ? {
        id: z.string().describe("Unique identifier for the document to fetch."),
      }
    : {
        url: z.string().describe("The URL of the webpage to read."),
      },
};

export const readDocsHandler: ToolHandler = async (args: {
  url?: string;
  id?: string;
}) => {
  if (OPENAI_MODE) {
    // OpenAI mode: expect 'id' parameter which should be a URL from search results
    const documentId = args.id;
    if (!documentId || typeof documentId !== "string") {
      return createParameterError("fetch", "id");
    }

    try {
      const text = await readDocs(documentId);

      const result: OpenAIDocumentResult = {
        id: documentId,
        title: `Documentation from ${extractHostname(documentId)}`,
        text,
        url: documentId,
        metadata: {
          source: "docfork",
          fetched_at: new Date().toISOString(),
        },
      };
      return createOpenAIDocumentResponse(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return createErrorResponse("fetch", msg);
    }
  } else {
    // Standard MCP mode: expect 'url' parameter
    const targetUrl = args.url;
    if (!targetUrl || typeof targetUrl !== "string") {
      return createParameterError("read-docs", "url");
    }

    try {
      const text = await readDocs(targetUrl);
      return { content: [{ type: "text", text }] };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return createErrorResponse("read-docs", msg);
    }
  }
};
