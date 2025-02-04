---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Improved exit animation for the `Dialog` component

In previous versions, if you used the [`Dialog`](https://ariakit.org/reference/dialog) component along with the [`unmountOnHide`](https://ariakit.org/reference/dialog#unmountonhide) prop without passing a [`store`](https://ariakit.org/reference/dialog#store) or wrapping it with [`DialogProvider`](https://ariakit.org/reference/dialog-provider), leave animations and transitions wouldn't run. This behavior should now be more consistent across different use cases.
