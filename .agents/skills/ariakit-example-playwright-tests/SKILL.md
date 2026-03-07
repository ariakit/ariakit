---
name: ariakit-example-playwright-tests
description: Authoring patterns for example Playwright tests.
---

# Ariakit Example Playwright Tests

- Put example Playwright tests in the `site` app, such as `site/src/examples/**/test-browser.ts` or `site/src/sandbox/**/test-browser.ts`, instead of using `website` paths.
- Prefer `withFramework(import.meta.dirname, async ({ test }) => { ... })` from `#app/test-utils/preview.ts` so the same test runs against each supported framework preview automatically.
- Use the injected Playwright helpers from `withFramework`, especially `q` for accessible queries and `visual()` for visual snapshots, instead of reimplementing custom page helpers when the shared utilities already cover the interaction.
- Add `@visual` to the test title whenever the test calls `visual()`, because `#app/test-utils/visual.ts` expects that tag for visual snapshot coverage.
- Run browser checks with the existing npm scripts from the repository root, such as `npm run test-browser`, `npm run test-chrome`, and their `-headed` / `-debug` variants, optionally passing an example path filter when needed.
