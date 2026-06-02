---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`useFormStore`](https://ariakit.com/reference/use-form-store) nested value updates so path segments like `-1`, `Infinity`, and `NaN` are treated as object keys instead of array indexes.
