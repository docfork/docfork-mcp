import dotenv from "dotenv";

// Load environment variables from .env file if present
// Completely suppress dotenv output to prevent stdout pollution in MCP stdio transport
const originalWrite = process.stdout.write;
process.stdout.write = () => true; // Temporarily suppress stdout
try {
  dotenv.config();
} finally {
  process.stdout.write = originalWrite; // Restore stdout
}

export interface ServerConfig {
  name: string;
  description: string;
  version: string;
  defaultMinimumTokens: number;
  port: number;
  transport: "stdio" | "streamable-http";
}

export function getServerConfig(): ServerConfig {
  // Get DEFAULT_MINIMUM_TOKENS from environment variable or use default
  let defaultMinimumTokens = 10000;
  if (process.env.DEFAULT_MINIMUM_TOKENS) {
    const parsedValue = parseInt(process.env.DEFAULT_MINIMUM_TOKENS, 10);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      defaultMinimumTokens = parsedValue;
    } else {
      console.warn(
        `Warning: Invalid DEFAULT_MINIMUM_TOKENS value provided in environment variable. Using default value of 10000`
      );
    }
  }

  // Get initial port from environment or use default
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  const transport = (process.env.MCP_TRANSPORT ||
    "stdio") as ServerConfig["transport"];

  return {
    name: "Docfork",
    description:
      "Gets the latest documentation and code examples for any library.",
    version: "0.7.0",
    defaultMinimumTokens,
    port,
    transport,
  };
}
