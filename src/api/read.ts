import { API_URL } from "./index.js";

interface ReadUrlResponse {
  text: string;
  library_identifier: string;
  version_info: string;
}

export async function readUrl(urlToRead: string): Promise<ReadUrlResponse> {
  const url = new URL(`${API_URL}/read`);
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
  return data as ReadUrlResponse;
}
