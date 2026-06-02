---
"@ariakit/test": patch
---

Improved happy-dom support

When simulating interactions in a happy-dom environment, `@ariakit/test` now polyfills several gaps so behavior matches jsdom and real browsers:

- `validationMessage` returns a non-empty message for elements failing built-in constraint validation (happy-dom leaves it empty).
- Disabled `<select>` and `<textarea>` controls are excluded from `FormData` (happy-dom incorrectly includes them).
- The `selectionchange` event that happy-dom fires synchronously inside `Selection.removeAllRanges()` is deferred to a task, as the spec requires.
- `window.alert` is stubbed as a no-op (happy-dom doesn't implement it).
