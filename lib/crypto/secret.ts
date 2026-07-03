import crypto from "node:crypto";

// NOTE: no `import "server-only"` here. This module is also imported by the
// provisioning/seed CLI scripts (run under tsx/plain Node), where `server-only`
// throws. It is only ever called server-side at runtime — the encryption key is
// read from `process.env.TENANT_DB_ENC_KEY` and never reaches the client.

// AES-256-GCM encryption for secrets stored at rest — specifically the per-tenant
// database connection strings kept in the control-plane Tenant registry. The key
// comes from `TENANT_DB_ENC_KEY`; never commit it. Payload format is
// `iv.tag.ciphertext`, all base64.

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.TENANT_DB_ENC_KEY;
  if (!raw) {
    throw new Error(
      "TENANT_DB_ENC_KEY is not set — required to encrypt tenant database URLs.",
    );
  }
  // Accept a raw 32-byte key (base64 or hex); otherwise derive one deterministically.
  const b64 = Buffer.from(raw, "base64");
  if (b64.length === 32) return b64;
  const hex = Buffer.from(raw, "hex");
  if (hex.length === 32) return hex;
  return crypto.createHash("sha256").update(raw, "utf8").digest();
}

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(
    ".",
  );
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Malformed encrypted secret.");
  }
  const decipher = crypto.createDecipheriv(
    ALGO,
    getKey(),
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
