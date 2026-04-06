---
"@ariakit/core": patch
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed [`formStore.setError()`](https://ariakit.org/reference/use-form-store#seterror) and [`formStore.setFieldTouched()`](https://ariakit.org/reference/use-form-store#setfieldtouched) failing to set values on nested array field paths such as `items.0.name`.
