import { z } from "zod";
import { readDocs } from "../api/read-docs.js";
import { ToolConfig, ToolHandler, DeepResearchShape } from "./types.js";

const OPENAI_MODE = process.env.DOCFORK_OPENAI_MODE === "1";

export const readDocsToolConfig: ToolConfig = {
  name: "docfork-read-docs",
  title: "Read Documentation URL",
  description:
    "Read the content of a documentation URL as markdown/text. Pass URLs from 'docfork-search-docs'.",
  inputSchema: {
    url: z.string().describe("The URL of the webpage to read."),
  },
};

export const readDocsHandler: ToolHandler = async ({ url }) => {
  if (!url || typeof url !== "string") {
    return {
      content: [{ type: "text", text: "Error: 'url' is required." }],
    };
  }

  try {
    const text = await readDocs(url);

    if (OPENAI_MODE) {
      const result: DeepResearchShape = {
        id: url,
        title: "", // Could extract from content if needed
        text,
        url,
      };
      return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }

    return { content: [{ type: "text", text }] };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error reading URL: ${msg}` }],
    };
  }
};
