import { BASE_URL } from "./index.js";
import { ReadDocsResponse } from "../tools/types.js";

export async function readDocs(urlToRead: string): Promise<ReadDocsResponse> {
  const url = new URL(`${BASE_URL}/read`);
  url.searchParams.set("url", urlToRead);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "User-Agent": "docfork-mcp",
      accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `${response.status} ${response.statusText}: ${text.slice(0, 500)}`
    );
  }

  // Parse JSON response and return text field
  const data = await response.json();
  return data;
}
