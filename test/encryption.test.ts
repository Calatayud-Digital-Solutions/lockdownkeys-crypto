import { describe, it, expect } from "vitest";
import {
  encrypt,
  decrypt,
  PBKDF2_ITERATIONS,
  SALT_BYTES,
  IV_BYTES,
  KEY_BITS,
} from "../src/index.js";

describe("AES-256-GCM encryption", () => {
  it("exports documented parameter constants", () => {
    expect(PBKDF2_ITERATIONS).toBe(250_000);
    expect(SALT_BYTES).toBe(16);
    expect(IV_BYTES).toBe(12);
    expect(KEY_BITS).toBe(256);
  });

  it("round-trips plaintext", async () => {
    const ct = await encrypt("hello world", "correct horse battery staple");
    expect(await decrypt(ct, "correct horse battery staple")).toBe("hello world");
  });

  it("rejects wrong password", async () => {
    const ct = await encrypt("secret", "right");
    await expect(decrypt(ct, "wrong")).rejects.toThrow(/Decryption failed/);
  });

  it("produces different ciphertext for the same plaintext (random IV+salt)", async () => {
    const a = await encrypt("x", "pw");
    const b = await encrypt("x", "pw");
    expect(a).not.toBe(b);
  });

  it("detects tampered ciphertext", async () => {
    const ct = await encrypt("data", "pw");
    const tampered = ct.slice(0, -2) + (ct.endsWith("A") ? "B=" : "A=");
    await expect(decrypt(tampered, "pw")).rejects.toThrow();
  });
});
