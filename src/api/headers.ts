import { DocforkAuthConfig } from "../config.js";
import { encryptClientIp } from "../lib/encryption.js";

/**
 * Generate headers for Docfork API requests
 * Handles authentication, cabinet headers, and client IP forwarding
 */
export function generateHeaders(auth?: DocforkAuthConfig): Record<string, string> {
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

  if (auth?.clientIp) {
    const encryptedIp = encryptClientIp(auth.clientIp);
    headers["X-Forwarded-For"] = encryptedIp;
  }

  return headers;
}
