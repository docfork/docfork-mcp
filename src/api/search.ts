import { BASE_URL } from "./index.js";

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
  tokens?: string
): Promise<SearchDocsResponse> {
  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.set("query", query);
  if (docforkIdentifier) {
    url.searchParams.set("libraryId", docforkIdentifier);
  }
  if (tokens) {
    url.searchParams.set("tokens", tokens);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "docfork-mcp",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `${response.status} ${response.statusText}: ${text.slice(0, 500)}`
    );
  }

  const result = await response.json();
  return result as SearchDocsResponse;
}
