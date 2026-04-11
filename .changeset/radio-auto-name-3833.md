---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Auto-generated `name` attribute for `Radio`

[`Radio`](https://ariakit.com/reference/radio) now automatically uses the [`RadioGroup`](https://ariakit.com/reference/radio-group) store's `id` as the default [`name`](https://ariakit.com/reference/radio#name) attribute when no explicit `name` prop is provided. This ensures consecutive [`RadioGroup`](https://ariakit.com/reference/radio-group) components have unique names, preventing the browser from treating all radio inputs as a single group and fixing Tab navigation and form submission issues.
