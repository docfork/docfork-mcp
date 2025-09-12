import { BASE_URL } from "./index.js";

/**
 * Fetch documentation for a library using the Docfork API
 * @param libraryIdentifier - The name or ID of the library to search for
 * @param topic - The topic to search for
 * @param tokens - The number of tokens to use for the search
 * @param isExactSearch - Whether to force exact search (overrides auto-detection)
 * @returns Promise<string | null>
 */
export async function search(
  topic: string,
  libraryId: string | undefined,
  libraryName: string | undefined,
  tokens?: number
): Promise<string | null> {
  const url = new URL(`${BASE_URL}/search`);

  // Determine search type: use explicit parameter or auto-detect
  if (libraryId) {
    url.searchParams.append("libraryId", libraryId);
  } else if (libraryName) {
    url.searchParams.append("libraryName", libraryName);
  } else {
    throw new Error("Either libraryId or libraryName must be provided");
  }

  url.searchParams.append("topic", topic);
  if (tokens) {
    url.searchParams.append("tokens", tokens.toString());
  }

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "docfork-mcp",
      },
    });

    if (!response.ok) {
      // Handle 422 responses - now returns text with suggestions
      if (response.status === 422) {
        const responseText = await response.text();
        // 422 now returns text directly, so just return it as-is
        return responseText;
      }
      // Try to get error details from response body for other errors
      let errorDetails = "";
      try {
        const responseText = await response.text();
        // Try to parse as JSON first
        try {
          const errorData = JSON.parse(responseText);
          // Based on API schema, error responses always have a 'message' field
          errorDetails =
            errorData.message || errorData.error || "Unknown error";
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

      throw new Error(errorMessage);
    }

    // Both 200 and 422 now return text, not JSON
    const responseText = await response.text();

    // Return the text response directly
    return responseText;
  } catch (error) {
    // Re-throw HTTP errors as-is (they contain status codes and details)
    if (
      error instanceof Error &&
      /^\d{3}\s/.test(error.message) // Matches "404 Not Found:" pattern
    ) {
      throw error;
    }

    // Handle network errors and other fetch failures
    const networkErrorMessage =
      error instanceof Error ? error.message : String(error);
    throw new Error(`Network error: ${networkErrorMessage}`);
  }
}
