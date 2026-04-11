---
"@ariakit/core": patch
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed `Math.random()` being called unconditionally when creating composite stores ([`useTabStore`](https://ariakit.com/reference/use-tab-store), [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store), [`useSelectStore`](https://ariakit.com/reference/use-select-store), etc.), even when an explicit `id` prop was provided. This was causing Next.js build errors with `cacheComponents` enabled.
