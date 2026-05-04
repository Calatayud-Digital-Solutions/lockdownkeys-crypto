/**
 * Web Crypto API resolution: browsers use globalThis.crypto; Node 18 may omit the global.
 */

import { webcrypto as nodeWebCrypto } from "node:crypto";

let cached: Crypto | null = null;

export function getWebCrypto(): Crypto {
  if (cached !== null) {
    return cached;
  }
  const g = (globalThis as { crypto?: Crypto }).crypto;
  if (g?.getRandomValues !== undefined && g.subtle !== undefined) {
    cached = g;
    return g;
  }
  const node = nodeWebCrypto as Crypto;
  cached = node;
  return node;
}
