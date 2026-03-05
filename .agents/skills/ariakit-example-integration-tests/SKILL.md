---
name: ariakit-example-integration-tests
description: Authoring patterns for example integration tests that use @ariakit/test.
---

# Ariakit Example Integration Tests

- Use existing `@ariakit/test` query helpers (`q.*`) and interaction utilities (`click`, `press`, `type`, `hover`, `dispatch`) instead of custom DOM helpers when possible.
- For elements that must exist before interaction, prefer `.ensure(...)` query helpers (for example `q.menuitemradio.ensure("Orange")` or `q.button.ensure("Actions")`) instead of non-null assertions or custom thrown errors.
- If an element may legitimately be absent, assert that behavior explicitly with matchers like `toBeInTheDocument` / `not.toBeInTheDocument` before interacting with it.
- Prefer focused assertions on accessible state and behavior (for example `aria-checked`, focus movement, and visible checkmarks) so regressions are caught at the UI level.
- Keep tests small and deterministic, matching existing examples in `examples/**/test.ts`.
