import crypto from "crypto";

/**
 * Simple AES-256-GCM helper for encrypting user-provided API credentials
 * (ApiCredential.encryptedValue) before they touch the database.
 * Requires CREDENTIAL_ENCRYPTION_KEY — a 32-byte key, base64 or hex encoded.
 */
function getKey(): Buffer {
  const raw = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("CREDENTIAL_ENCRYPTION_KEY is not set. Add a 32-byte base64 key to your environment.");
  }
  const key = Buffer.from(raw, raw.length === 44 ? "base64" : "hex");
  if (key.length !== 32) throw new Error("CREDENTIAL_ENCRYPTION_KEY must decode to exactly 32 bytes.");
  return key;
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decrypt(payload: string): string {
  const key = getKey();
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const authTag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
