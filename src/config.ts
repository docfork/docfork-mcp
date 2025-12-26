import dotenv from "dotenv";

// Load environment variables from .env file if present
// Suppress dotenv output to prevent stdout pollution in MCP stdio transport
const originalWrite = process.stdout.write;
process.stdout.write = () => true;
try {
  dotenv.config({ quiet: true });
} finally {
  process.stdout.write = originalWrite;
}

export interface ServerConfig {
  name: string;
  description: string;
  version: string;
  defaultMinimumTokens: number;
  port: number;
  transport: "stdio" | "streamable-http";
  mcpClient?: string;
}

function parseEnvInt(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed <= 0) {
    console.warn(
      `Warning: Invalid ${key} value "${value}". Using default: ${defaultValue}`
    );
    return defaultValue;
  }
  return parsed;
}

export function getServerConfig(): ServerConfig {
  return {
    name: "Docfork",
    description:
      "Gets the latest documentation and code examples for any library.",
    version: "1.2.0",
    defaultMinimumTokens: parseEnvInt("DEFAULT_MINIMUM_TOKENS", 10000),
    port: parseEnvInt("PORT", 3000),
    transport: (process.env.MCP_TRANSPORT ||
      "stdio") as ServerConfig["transport"],
  };
}
