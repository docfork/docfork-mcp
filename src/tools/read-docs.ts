import { z } from "zod";
import { readDocs } from "../api/read-docs.js";
import { ToolConfig, ToolHandler, DeepResearchShape } from "./types.js";

const OPENAI_MODE = process.env.DOCFORK_OPENAI_MODE === "1";

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

export const readDocsHandler: ToolHandler = async ({ url, id }) => {
  // In OpenAI mode, use 'id' parameter, otherwise use 'url'
  const targetUrl = OPENAI_MODE ? id : url;
  const paramName = OPENAI_MODE ? "id" : "url";

  if (!targetUrl || typeof targetUrl !== "string") {
    return {
      content: [
        {
          type: "text",
          text: `[read-docs tool] Error: '${paramName}' is required.`,
        },
      ],
    };
  }

  try {
    const text = await readDocs(targetUrl);

    if (OPENAI_MODE) {
      // OpenAI ChatGPT format
      const result = {
        id: targetUrl,
        title: `Documentation from ${new URL(targetUrl).hostname}`, // Extract hostname for title
        text,
        url: targetUrl,
        metadata: {
          source: "docfork",
          fetched_at: new Date().toISOString(),
        },
      };
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }

    return { content: [{ type: "text", text }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `[read-docs tool] ${msg}` }],
    };
  }
};
