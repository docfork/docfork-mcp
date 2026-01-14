import { API_URL } from "./index.js";
import { generateHeaders } from "./headers.js";
import { DocforkAuthConfig } from "../config.js";

// section item in search results
interface SearchSection {
  url: string;
  title: string;
  content: string;
}

// response from the search API
interface SearchDocsResponse {
  sections: SearchSection[];
  truncated?: boolean;
}

export async function searchDocs(
  query: string,
  docforkIdentifier?: string,
  tokens?: string,
  auth?: DocforkAuthConfig
): Promise<SearchDocsResponse> {
  const url = new URL(`${API_URL}/search`);
  url.searchParams.set("query", query);
  if (docforkIdentifier) {
    url.searchParams.set("libraryId", docforkIdentifier);
  }
  if (tokens) {
    url.searchParams.set("tokens", tokens);
  }

  const headers = generateHeaders(auth);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
  }

  const result = await response.json();
  return result as SearchDocsResponse;
}
