---
name: ariakit-example-playwright-tests
description: Authoring patterns for example Playwright tests.
---

# Ariakit Example Playwright Tests

- Put example Playwright tests in the `site` app, usually as `test-browser.ts` files under paths like `site/src/examples/**/test-browser.ts` or `site/src/sandbox/**/test-browser.ts`, instead of using `website` paths.
- Prefer `withFramework(import.meta.dirname, async ({ test }) => { ... })` from `#app/test-utils/preview.ts` so the same test runs against each supported framework preview automatically.
- Use the injected Playwright helpers from `withFramework`, especially `q` for accessible queries and `visual()` for visual snapshots, instead of reimplementing custom page helpers when the shared utilities already cover the interaction.
- Add `@visual` to the test title whenever the test calls `visual()`, because `#app/test-utils/visual.ts` expects that tag for visual snapshot coverage.
- Run those `test-browser.ts` files with the scripts in `site/package.json` via workspace commands such as `pnpm -F site run test`, `pnpm -F site run test-chrome`, and the `-headed` variants.
- Never run visual test scripts (`test-visual*`) locally. Visual screenshots are OS-dependent and only run on CI. The `visual()` helper enforces this by requiring both `VISUAL_TEST=true` and `CI=true`. Tests with `@visual` can still run locally without `VISUAL_TEST` — they just skip screenshots.
