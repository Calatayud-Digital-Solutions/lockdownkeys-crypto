import { describe, expect, it } from "vitest";
import { getWebCrypto } from "../src/webcrypto.js";

describe("getWebCrypto", () => {
  it("exposes getRandomValues and subtle (Node CI / browser)", () => {
    const cryptoApi = getWebCrypto();
    const buf = new Uint8Array(8);
    cryptoApi.getRandomValues(buf);
    expect(buf).toHaveLength(8);
    expect(cryptoApi.subtle).toBeDefined();
    expect(typeof cryptoApi.subtle.importKey).toBe("function");
  });
});
