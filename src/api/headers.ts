import { DocforkAuthConfig } from "../config.js";

/**
 * Generate headers for Docfork API requests
 * Handles authentication and cabinet headers
 */
export function generateHeaders(
  auth?: DocforkAuthConfig
): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "docfork-mcp",
    "Content-Type": "application/json",
    accept: "application/json",
  };

  if (auth?.apiKey) {
    headers["Authorization"] = `Bearer ${auth.apiKey}`;
  }

  if (auth?.cabinet) {
    headers["X-Docfork-Cabinet"] = auth.cabinet;
  }

  return headers;
}
