import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "../src/encryption.js";

describe("AES-256-GCM encryption", () => {
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
