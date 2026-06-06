---
"@ariakit/test": patch
---

Applied the browser shims for the whole test environment

`@ariakit/test` installs browser shims (most importantly a `getClientRects` visibility shim that jsdom lacks). They were only active while a simulated interaction ran, but component code reads layout and focusability between interactions too — for example a dialog's auto-focus picks the first tabbable element with `getFirstTabbableIn`, which depends on `getClientRects`. When such a read ran outside an interaction (e.g. when asserting with `expect.poll`), it hit jsdom's empty layout and misbehaved. The shims now apply for the whole test environment.

The shims are applied automatically when importing `@ariakit/test` or `@ariakit/test/react`. A new `@ariakit/test/shims` entrypoint also lets you apply them manually when importing only individual helpers.
