import { searchDocs } from "./search.js";
import { readUrl } from "./read.js";

// allow override via environment variable
export const API_URL = process.env.API_URL || "https://api.docfork.com/v1";

export { searchDocs, readUrl };
