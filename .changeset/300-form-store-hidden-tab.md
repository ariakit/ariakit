---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Form submission no longer stalls while the tab is hidden

[`useFormStore`](https://ariakit.com/reference/use-form-store)'s [`submit`](https://ariakit.com/reference/use-form-store#submit) and [`validate`](https://ariakit.com/reference/use-form-store#validate) no longer stall while the document is hidden — for example, when auto-saving a draft on `visibilitychange`.

They previously awaited a `requestAnimationFrame`, which browsers pause in background tabs, so the submission only completed once the tab was brought back to the foreground.
