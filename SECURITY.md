# Security Policy

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report privately to **security@lockdownkeys.com**. We aim to:

- Acknowledge receipt within **48 hours**
- Provide an initial assessment within **7 days**
- Publish a fix and credit you (if desired) within **90 days**

## Supported versions

Only the latest minor version on `main` is supported with security updates.

## Scope

In scope:
- Cryptographic flaws in `encryption.ts`, `generator.ts`, `strength.ts`
- Side-channel leaks in the published API
- Dependency vulnerabilities affecting end users

Out of scope:
- Bugs in example/test code
- Issues requiring a compromised client device
