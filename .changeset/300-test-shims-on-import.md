---
"@ariakit/test": patch
---

Fixed the browser shims to apply for the entire test instead of only while a simulated interaction runs. Component code that reads layout or focusability between interactions — such as a dialog's auto-focus picking the first tabbable element, which relies on the `getClientRects` visibility shim — now behaves consistently, including when asserting outside an interaction with `expect.poll`.

The shims are applied automatically when importing `@ariakit/test` or `@ariakit/test/react`. A new `@ariakit/test/shims` entrypoint also lets you apply them manually when importing only individual helpers.
