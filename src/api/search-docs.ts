import { BASE_URL } from "./index.js";
import { SearchDocsResponse } from "../tools/types.js";

export async function searchDocs(
  query: string,
  tokens?: string
): Promise<SearchDocsResponse> {
  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.set("query", query);
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
  console.log(result);
  return result as SearchDocsResponse;
}
