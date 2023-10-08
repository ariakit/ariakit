---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Added [`unmountOnHide`](https://ariakit.org/reference/disclosure-content#unmountonhide) prop to [`DisclosureContent`](https://ariakit.org/reference/disclosure-content), [`Dialog`](https://ariakit.org/reference/dialog) and related components.

Conditionally rendering the [`Dialog`](https://ariakit.org/reference/dialog) and related components will continue to work as before:

```jsx
open && <Dialog>
```

Now, you can do the same thing using the [`unmountOnHide`](https://ariakit.org/reference/dialog#unmountonhide) prop:

```jsx
<Dialog unmountOnHide>
```
