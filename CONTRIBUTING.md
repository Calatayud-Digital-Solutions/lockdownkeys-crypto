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

## Publishing (`@calaespi/crypto`)

Releases are automated with [`.github/workflows/publish-npm.yml`](.github/workflows/publish-npm.yml).

1. Add the **`NPM_TOKEN`** secret to the GitHub repo (npm → Access Tokens → granular token with **Publish** on the `@calaespi` scope).
2. On `main`, set the new version in `package.json`, commit, then create and push a matching tag:
   ```bash
   git tag v0.1.1
   git push origin main
   git push origin v0.1.1
   ```
   The tag `v*.*.*` must equal the `version` field in `package.json`.

You can also trigger **Publish npm** manually from the Actions tab (`workflow_dispatch`).

## PR checklist

- [ ] `npm test` passes
- [ ] `npm run build` produces `dist/` cleanly
- [ ] New behaviour documented in `README.md`
- [ ] No new runtime dependencies added

## License of contributions

By submitting a PR you agree to license your contribution under **AGPL-3.0-or-later**, the same license as the project.
