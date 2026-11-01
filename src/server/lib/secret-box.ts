import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// AES-256-GCM for secrets stored in the database (payment gateway passwords/keys).
// Key = SHA-256 of CREDENTIALS_KEY. Format: "v1:" + base64(iv[12] | tag[16] | ciphertext).

const PREFIX = "v1:";

function key(): Buffer {
  const secret = process.env.CREDENTIALS_KEY;
  if (!secret || secret.length < 32) {
    throw new Error("CREDENTIALS_KEY (32+ characters) is required to store gateway credentials");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return PREFIX + Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64");
}

export function decryptSecret(sealed: string): string {
  if (!sealed.startsWith(PREFIX)) throw new Error("Unknown secret format");
  const raw = Buffer.from(sealed.slice(PREFIX.length), "base64");
  const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
}

/** "••••1234" — enough for staff to recognise which key is saved. */
export function maskSecret(plain: string): string {
  return plain.length <= 4 ? "••••" : `••••${plain.slice(-4)}`;
}
