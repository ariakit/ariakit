---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`useFormStore`](https://ariakit.com/reference/use-form-store)'s [`submit`](https://ariakit.com/reference/use-form-store#submit) and [`validate`](https://ariakit.com/reference/use-form-store#validate) stalling while the document is hidden — for example, when auto-saving on `visibilitychange` — because they awaited a `requestAnimationFrame` that browsers pause in background tabs. They also no longer throw a `ReferenceError` when called outside a browser.
