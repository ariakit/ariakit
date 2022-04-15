---
"ariakit": major
---

The `padding` prop has been renamed to `overflowPadding` on `usePopoverState` and derived hooks. ([#1229](https://github.com/ariakit/ariakit/pull/1229))

```diff
const popover = usePopoverState({
- padding: 4,
+ overflowPadding: 4,
});
```
