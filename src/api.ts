const BASE_URL = "https://api.docfork.com/v1/mcp/";

/**
 * Fetch documentation for a library using the Docfork API
 * @param libraryName - The name of the library to search for
 * @param topic - The topic to search for
 * @param tokens - The number of tokens to use for the search
 * @returns Promise<string | null>
 */
export async function fetchLibraryDocs(
  libraryName: string,
  topic: string,
  tokens?: number
): Promise<string | null> {
  const url = new URL(`${BASE_URL}public/search`);
  url.searchParams.append("libraryName", libraryName);
  url.searchParams.append("topic", topic);
  if (tokens) {
    url.searchParams.append("tokens", tokens.toString());
  }

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Docfork-Source": "mcp",
      },
    });

    if (!response.ok) {
      // Try to get error details from response body
      let errorDetails = "";
      try {
        const responseText = await response.text();
        // Try to parse as JSON first
        try {
          const errorData = JSON.parse(responseText);
          errorDetails = errorData.error || errorData.message || "";
        } catch {
          // If not valid JSON, use the raw text
          errorDetails = responseText.substring(0, 200); // Limit length
        }
      } catch {
        // If we can't read the response body at all
        errorDetails = "Unable to read error response";
      }

      const errorMessage = errorDetails
        ? `${response.status} ${response.statusText}: ${errorDetails}`
        : `${response.status} ${response.statusText}`;

      throw new Error(
        `Failed to fetch documentation for library "${libraryName}" (topic: "${topic}"): ${errorMessage}`
      );
    }

    // The API returns a plain string, not JSON
    const responseText = await response.text();
    return responseText;
  } catch (error) {
    // Re-throw our custom errors as-is
    if (
      error instanceof Error &&
      error.message.includes("Failed to fetch documentation")
    ) {
      throw error;
    }

    // Handle network errors and other fetch failures
    throw new Error(
      `Network error while fetching documentation for library "${libraryName}" (topic: "${topic}"): ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
