import { BASE_URL } from "./index.js";

export async function readDocs(urlToRead: string): Promise<string> {
  const url = new URL(`${BASE_URL}/read`);
  url.searchParams.set("url", urlToRead);

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

  // Always return text content
  return await response.text();
}
