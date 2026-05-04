/**
 * AES-256-GCM client-side encryption with PBKDF2 key derivation.
 *
 * Threat model: server NEVER sees plaintext or master password.
 * All ciphertext is bound to a per-record IV and authenticated via GCM tag.
 *
 * Format produced by `encrypt()`:
 *   base64( salt(16) || iv(12) || ciphertext+tag )
 *
 * @license AGPL-3.0-or-later
 */

const PBKDF2_ITERATIONS = 250_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const KEY_BITS = 256;

const subtle = (): SubtleCrypto => {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (!c?.subtle) {
    throw new Error(
      "WebCrypto SubtleCrypto is not available in this environment. " +
        "Use a modern browser, Node 18+ or Deno."
    );
  }
  return c.subtle;
};

const randomBytes = (n: number): Uint8Array => {
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
};

const enc = new TextEncoder();
const dec = new TextDecoder();

/** Copy into a standalone ArrayBuffer so WebCrypto accepts the value as BufferSource. */
function copyToArrayBuffer(data: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(data.byteLength);
  new Uint8Array(buf).set(data);
  return buf;
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return typeof btoa !== "undefined"
    ? btoa(bin)
    : Buffer.from(bytes).toString("base64");
}

function fromBase64(b64: string): Uint8Array {
  if (typeof atob !== "undefined") {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(b64, "base64"));
}

/**
 * Derive a 256-bit AES-GCM key from a master password using PBKDF2-SHA-256.
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const baseKey = await subtle().importKey(
    "raw",
    copyToArrayBuffer(enc.encode(password)),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return subtle().deriveKey(
    { name: "PBKDF2", salt: copyToArrayBuffer(salt), iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: KEY_BITS },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a UTF-8 string with the given master password.
 * Output is a single base64 string containing salt + iv + ciphertext+tag.
 */
export async function encrypt(
  plaintext: string,
  password: string
): Promise<string> {
  if (typeof plaintext !== "string") throw new TypeError("plaintext must be string");
  if (!password) throw new Error("password is required");

  const salt = randomBytes(SALT_BYTES);
  const iv = randomBytes(IV_BYTES);
  const key = await deriveKey(password, salt);

  const ct = new Uint8Array(
    await subtle().encrypt(
      { name: "AES-GCM", iv: copyToArrayBuffer(iv) },
      key,
      copyToArrayBuffer(enc.encode(plaintext))
    )
  );

  const out = new Uint8Array(salt.length + iv.length + ct.length);
  out.set(salt, 0);
  out.set(iv, salt.length);
  out.set(ct, salt.length + iv.length);
  return toBase64(out);
}

/**
 * Decrypt a payload produced by `encrypt()`.
 * Throws if the password is wrong or the ciphertext was tampered with.
 */
export async function decrypt(
  payload: string,
  password: string
): Promise<string> {
  const buf = fromBase64(payload);
  if (buf.length < SALT_BYTES + IV_BYTES + 16) {
    throw new Error("Invalid ciphertext payload");
  }
  const salt = buf.slice(0, SALT_BYTES);
  const iv = buf.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const ct = buf.slice(SALT_BYTES + IV_BYTES);

  const key = await deriveKey(password, salt);
  try {
    const pt = await subtle().decrypt(
      { name: "AES-GCM", iv: copyToArrayBuffer(iv) },
      key,
      copyToArrayBuffer(ct)
    );
    return dec.decode(pt);
  } catch {
    throw new Error("Decryption failed: wrong password or corrupted data");
  }
}
