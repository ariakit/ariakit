---
"ariakit": major
---

Replaced `defaultAnchorRect`, `anchorRect` and `setAnchorRect` props on `usePopoverState` by a single `getAnchorRect` prop. ([#1252](https://github.com/ariakit/ariakit/pull/1252))

Before:

```js
const popover = usePopoverState();

// inside an effect or event handler
popover.setAnchorRect({ x: 10, y: 10 });
```

After:

```js
const popover = usePopoverState({ getAnchorRect: () => ({ x: 10, y: 10 }) });
```
