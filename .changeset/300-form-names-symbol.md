---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`useFormStore`](https://ariakit.com/reference/use-form-store) [`names`](https://ariakit.com/reference/use-form-store#names) values throwing `Cannot convert a Symbol value to a string` when a symbol key was read from them, such as when React probes a name rendered as a React child for `Symbol.iterator`. Absent symbol keys now resolve to `undefined` like a plain object, so string coercion such as `` `${form.names.email}` `` keeps working while raw access degrades gracefully.
