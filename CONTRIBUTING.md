# Contributing

Thanks for your interest in improving the cryptographic core of Lock Down Keys!

## Ground rules

1. **No new dependencies** in `src/` without strong justification — this package must stay auditable.
2. **All public APIs require tests** in `test/`.
3. **Cryptographic changes require a written rationale** in the PR description, ideally with references (RFC, NIST, etc.).
4. **No telemetry, no analytics, no network calls** — ever.

## Local development

```bash
npm install
npm test
npm run build
```

## PR checklist

- [ ] `npm test` passes
- [ ] `npm run build` produces `dist/` cleanly
- [ ] New behaviour documented in `README.md`
- [ ] No new runtime dependencies added

## License of contributions

By submitting a PR you agree to license your contribution under **AGPL-3.0-or-later**, the same license as the project.
