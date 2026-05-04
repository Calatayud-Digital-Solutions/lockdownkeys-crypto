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

1. Add the **`NPM_TOKEN`** secret to the GitHub repo. The token must allow **non-interactive** publish (CI cannot type a 2FA code):
   - **Recommended:** [Granular access token](https://docs.npmjs.com/creating-and-viewing-access-tokens) → include org **`calaespi`** → **Packages: Read and write** for the scope (or the package).
   - **Alternative (classic):** token type **Automation** — not "Publish". Automation tokens are meant for CI and do not require `--otp`.  
   If you use a normal publish token or your account blocks automation, `npm publish` fails with **`EOTP` / one-time password**.
   - In npm profile **Access** / **Security**: avoid settings that **force 2FA on every publish** without allowing automation tokens. See [2FA and tokens](https://docs.npmjs.com/about-two-factor-authentication).
2. On `main`, bump `version` in `package.json`, **commit and push first**, then tag **that** commit and push the tag:
   ```bash
   git add package.json
   git commit -m "chore: release 0.1.1"
   git push origin main
   git tag v0.1.1
   git push origin v0.1.1
   ```
   The tag name without `v` must equal `package.json` `version`. If you already pushed a tag on the wrong commit, delete it and recreate it on the release commit:
   ```bash
   git push origin :refs/tags/v0.1.1
   git tag -d v0.1.1
   git pull origin main
   git tag v0.1.1 && git push origin v0.1.1
   ```

You can also trigger **Publish npm** manually from the Actions tab (`workflow_dispatch`).

## PR checklist

- [ ] `npm test` passes
- [ ] `npm run build` produces `dist/` cleanly
- [ ] New behaviour documented in `README.md`
- [ ] No new runtime dependencies added

## License of contributions

By submitting a PR you agree to license your contribution under **AGPL-3.0-or-later**, the same license as the project.
