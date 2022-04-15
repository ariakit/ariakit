---
"ariakit": major
---

The `preventOverflow` prop has been renamed to `slide` on `usePopoverState` and derived state hooks. ([#1229](https://github.com/ariakit/ariakit/pull/1229))

```diff
  const popover = usePopoverState({
-   preventOverflow: false,
+   slide: false,
  });
```
