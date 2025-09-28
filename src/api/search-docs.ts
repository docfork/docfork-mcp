import { BASE_URL } from "./index.js";
import { SearchDocsItem } from "../tools/types.js";
  

export async function searchDocs(
  query: string
): Promise<SearchDocsItem[] | string> {
  if (!query || query.trim() === "") {
    throw new Error("Query is required");
  }

  const url = new URL(`${BASE_URL}/search`);
  url.searchParams.set("query", query);

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
      `${response.status} ${response.statusText}: ${text.slice(0, 200)}`
    );
  }

  const ct = response.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return await response.text();
  }

  return (await response.json()) as SearchDocsItem[];
}
