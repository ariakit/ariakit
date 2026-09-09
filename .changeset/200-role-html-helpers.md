---
"@ariakit/react-components": patch
"@ariakit/react": patch
"@ariakit/solid-components": patch
"@ariakit/solid": patch
---

More HTML helpers for `Role`

[`Role`](https://ariakit.com/reference/role) now includes helpers for standard HTML elements such as `kbd`, `hr`, `code`, `main`, `fieldset`, and `table` in React and Solid. Each helper renders its named element and accepts its native props and ref, with the same composition options as existing helpers.

```tsx
<Role.kbd>⌘K</Role.kbd>
<Role.hr />
<Role.time dateTime="2026-09-09">September 9</Role.time>
```
