---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`useFormStore`](https://ariakit.com/reference/use-form-store) to ignore `__proto__` and `constructor` path segments in field names, preventing form state objects from being corrupted through prototype replacement.
