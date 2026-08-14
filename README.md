# @calaespi/crypto

> Client-side **AES-256-GCM** encryption, cryptographically-secure **password generator** and **strength checker** used by [Lock Down Keys](https://lockdownkeys.com).

[![CI](https://github.com/Calatayud-Digital-Solutions/lockdownkeys-crypto/actions/workflows/ci.yml/badge.svg)](https://github.com/Calatayud-Digital-Solutions/lockdownkeys-crypto/actions/workflows/ci.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![npm](https://img.shields.io/npm/v/@calaespi/crypto.svg)](https://www.npmjs.com/package/@calaespi/crypto)

---

## Why open source?

Lock Down Keys is a zero-knowledge password manager. **Trust requires verification**: anyone should be able to read, audit and reproduce the cryptography that protects user data.

This package publishes the **reusable, auditable primitives**:

- 🔐 **AES-256-GCM** authenticated encryption with random 12-byte IV
- 🔑 **PBKDF2-SHA-256**, 250 000 iterations, 16-byte salt — password-based `encrypt` / `decrypt`
- 🎲 **`crypto.getRandomValues`** rejection-sampled to avoid modulo bias
- 📐 **Shannon-entropy** strength estimator with common-pattern penalties

Database and storage **never** hold plaintext, the master password, or the derived key. The client must be trusted: compromised web application code can access the master password or plaintext before encryption.

### Relation to the Lock Down Keys vault

The **production vault** (web app and browser extension) uses the **same building blocks** (WebCrypto AES-256-GCM + PBKDF2-HMAC-SHA-256 + CSPRNG), but a **different key hierarchy**:

| Concern | This package (`encrypt` / `decrypt`) | Production vault |
|---------|--------------------------------------|------------------|
| Key model | Password derives the AES key used for that payload | Master password → KEK (PBKDF2) wraps a random DEK; fields encrypt with the DEK |
| Default PBKDF2 iterations | **250 000** (fixed in this API) | **310 000** (stored per vault as `kdf_iterations`) |
| Ciphertext shape | `base64(salt ‖ iv ‖ ciphertext+tag)` | `v1:` + `base64(iv ‖ ciphertext+tag)` for fields; wrapped DEK + verifier stored separately |
| Scope | Standalone password-based encryption, generator, strength | Unlock vault, wrap/unwrap DEK, encrypt vault fields, sharing |

Use this package to audit the primitives and for standalone encryption. Do **not** assume payloads from `encrypt()` are interchangeable with vault field ciphertext in the Lock Down Keys product.

## Install

```bash
npm install @calaespi/crypto
```

Works in modern browsers, Node 18+, Deno, Bun, React Native (with WebCrypto polyfill).

## Usage

```ts
import { encrypt, decrypt, generatePassword, estimateStrength } from "@calaespi/crypto";

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

Exported constants (`PBKDF2_ITERATIONS`, `SALT_BYTES`, `IV_BYTES`, `KEY_BITS`) match the table above.

### What this protects against

- **Database/storage compromise**: ciphertext alone is useless without the user's password.
- **Tampering**: GCM authentication tag fails decryption on any modification.
- **Rainbow tables**: per-record salt + 250k PBKDF2 iterations.
- **Modulo bias** in the password generator (rejection sampling).

### What this does NOT protect against

- A compromised client (keylogger, malicious extension, or tampered web application code that can read the master password or plaintext before encryption).
- A weak password — entropy ultimately depends on the user.
- Side-channel attacks on shared hardware.

## Audit & contribute

This code is intentionally small (< 400 LOC) so it can be audited in an afternoon. PRs that improve security, performance, or test coverage are welcome.

- 🐛 [Report a vulnerability](mailto:info@calatayud-digital-solutions.es) (responsible disclosure, please don't open public issues for sec bugs)
- 💬 [Open an issue](https://github.com/Calatayud-Digital-Solutions/lockdownkeys-crypto/issues)

## License

**AGPL-3.0-or-later** — if you run a modified version as a network service, you must publish your changes. See [LICENSE](./LICENSE).

For commercial licenses without the AGPL network clause, contact info@calatayud-digital-solutions.es.

---

Built with ❤️ by [Calatayud Digital Solutions](https://lockdownkeys.com).
