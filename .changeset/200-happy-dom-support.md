---
"@ariakit/test": patch
---

Improved happy-dom support by reporting a non-empty `validationMessage` for elements with built-in constraint violations (which happy-dom leaves empty) and by excluding disabled `<select>` and `<textarea>` controls from `FormData` (which happy-dom incorrectly includes).
