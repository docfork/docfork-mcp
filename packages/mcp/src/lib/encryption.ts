import { createCipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.CLIENT_IP_ENCRYPTION_KEY;

function validateEncryptionKey(key: string): boolean {
  // Must be exactly 64 hex characters (32 bytes)
  return /^[0-9a-fA-F]{64}$/.test(key);
}

/**
 * Encrypt client IP address using AES-256-CBC
 * Only encrypts if CLIENT_IP_ENCRYPTION_KEY is set, otherwise returns plain IP
 * @param clientIp - The client IP address to encrypt
 * @returns Encrypted IP string in format "iv:encrypted" or plain IP if no key is set
 */
export function encryptClientIp(clientIp: string): string {
  // If no encryption key is set, return plain IP (most common case)
  if (!ENCRYPTION_KEY) {
    return clientIp;
  }

  if (!validateEncryptionKey(ENCRYPTION_KEY)) {
    console.error("Invalid encryption key format. Must be 64 hex characters. Sending plain IP.");
    return clientIp; // Fallback to unencrypted
  }

  try {
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), iv);
    let encrypted = cipher.update(clientIp, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Error encrypting client IP:", error);
    return clientIp; // Fallback to unencrypted
  }
}
