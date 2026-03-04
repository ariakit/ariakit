---
name: ariakit-example-integration-tests
description: Authoring patterns for example integration tests that use @ariakit/test.
---

# Ariakit Example Integration Tests

- Use existing `@ariakit/test` query helpers (`q.*`) and interaction utilities (`click`, `press`, `type`, `hover`, `dispatch`) instead of custom DOM helpers when possible.
- Follow existing test style by using non-null assertions (`!`) for elements that are guaranteed by the test setup (for example `q.menuitemradio("Orange")!` or `q.textbox.all().at(0)!`) instead of custom thrown errors for null checks.
- If an element may legitimately be absent, assert that behavior explicitly with matchers like `toBeInTheDocument` / `not.toBeInTheDocument` before interacting with it.
- Prefer focused assertions on accessible state and behavior (for example `aria-checked`, focus movement, and visible checkmarks) so regressions are caught at the UI level.
- Keep tests small and deterministic, matching existing examples in `examples/**/test.ts`.
