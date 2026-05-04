# @lockdownkeys/crypto

> Client-side **AES-256-GCM** encryption, cryptographically-secure **password generator** and **strength checker** — the open-source cryptographic core of [Lock Down Keys](https://lockdownkeys.com).

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![npm](https://img.shields.io/npm/v/@lockdownkeys/crypto.svg)](https://www.npmjs.com/package/@lockdownkeys/crypto)

---

## Why open source?

Lock Down Keys is a zero-knowledge password manager. **Trust requires verification**: anyone should be able to read, audit and reproduce the cryptography that protects user data. This package contains the exact primitives running in production:

- 🔐 **AES-256-GCM** authenticated encryption with random 12-byte IV
- 🔑 **PBKDF2-SHA-256**, 250 000 iterations, 16-byte salt — derived per record
- 🎲 **`crypto.getRandomValues`** rejection-sampled to avoid modulo bias
- 📐 **Shannon-entropy** strength estimator with common-pattern penalties

The server **never** sees plaintext, the master password, or the derived key.

## Install

```bash
npm install @lockdownkeys/crypto
```

Works in modern browsers, Node 18+, Deno, Bun, React Native (with WebCrypto polyfill).

## Usage

```ts
import { encrypt, decrypt, generatePassword, estimateStrength } from "@lockdownkeys/crypto";

// 1. Encrypt
const blob = await encrypt("my secret note", "correct horse battery staple");
// → "Q2qf...base64..." (salt|iv|ciphertext+tag)

// 2. Decrypt
const plain = await decrypt(blob, "correct horse battery staple");

// 3. Generate
const pw = generatePassword({ length: 24, symbols: true, excludeAmbiguous: true });

// 4. Audit strength
const { label, entropyBits, crackTimeSeconds } = estimateStrength(pw);
```

## Cryptographic details

| Parameter        | Value                          |
|------------------|--------------------------------|
| Cipher           | AES-256-GCM                    |
| Key size         | 256 bits                       |
| IV size          | 96 bits (random per encrypt)   |
| Auth tag         | 128 bits (built into GCM)      |
| KDF              | PBKDF2-HMAC-SHA-256            |
| KDF iterations   | 250 000                        |
| Salt size        | 128 bits (random per encrypt)  |
| Payload format   | `base64(salt ‖ iv ‖ ciphertext+tag)` |
| RNG              | `crypto.getRandomValues` (CSPRNG, rejection-sampled) |

### What this protects against

- **Server compromise**: ciphertext alone is useless without the user's master password.
- **Tampering**: GCM authentication tag fails decryption on any modification.
- **Rainbow tables**: per-record salt + 250k PBKDF2 iterations.
- **Modulo bias** in the password generator (rejection sampling).

### What this does NOT protect against

- A compromised client device (keylogger, malicious extension).
- A weak master password — entropy ultimately depends on the user.
- Side-channel attacks on shared hardware.

## Audit & contribute

This code is intentionally small (< 400 LOC) so it can be audited in an afternoon. PRs that improve security, performance, or test coverage are welcome.

- 🐛 [Report a vulnerability](mailto:security@lockdownkeys.com) (responsible disclosure, please don't open public issues for sec bugs)
- 💬 [Open an issue](https://github.com/Calatayud-Digital-Solutions/lockdownkeys-crypto/issues)

## License

**AGPL-3.0-or-later** — if you run a modified version as a network service, you must publish your changes. See [LICENSE](./LICENSE).

For commercial licenses without the AGPL network clause, contact info@lockdownkeys.com.

---

Built with ❤️ by [Calatayud Digital Solutions](https://lockdownkeys.com).
