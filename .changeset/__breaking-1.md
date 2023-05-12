---
"@ariakit/core": minor
"@ariakit/react-core": minor
"@ariakit/react": minor
---

**BREAKING**: Moved props from the `usePopoverStore` hook to the `Popover` component: `fixed`, `gutter`, `shift`, `flip`, `slide`, `overlap`, `sameWidth`, `fitViewport`, `arrowPadding`, `overflowPadding`, `getAnchorRect`, `renderCallback` (renamed to `updatePosition`). ([#2279](https://github.com/ariakit/ariakit/pull/2279))

The exception is the `placement` prop that should still be passed to the store.

**Before**:

```jsx
const popover = usePopoverStore({
  placement: "bottom",
  fixed: true,
  gutter: 8,
  shift: 8,
  flip: true,
  slide: true,
  overlap: true,
  sameWidth: true,
  fitViewport: true,
  arrowPadding: 8,
  overflowPadding: 8,
  getAnchorRect: (anchor) => anchor?.getBoundingClientRect(),
  renderCallback: (props) => props.defaultRenderCallback(),
});

<Popover store={popover} />;
```

**After**:

```jsx
const popover = usePopoverStore({ placement: "bottom" });

<Popover
  store={popover}
  fixed
  gutter={8}
  shift={8}
  flip
  slide
  overlap
  sameWidth
  fitViewport
  arrowPadding={8}
  overflowPadding={8}
  getAnchorRect={(anchor) => anchor?.getBoundingClientRect()}
  updatePosition={(props) => props.updatePosition()}
/>;
```

This change affects all the hooks and components that use `usePopoverStore` and `Popover` underneath: `useComboboxStore`, `ComboboxPopover`, `useHovercardStore`, `Hovercard`, `useMenuStore`, `Menu`, `useSelectStore`, `SelectPopover`, `useTooltipStore`, `Tooltip`.

With this change, the underlying `@floating-ui/dom` dependency has been also moved to the `Popover` component, which means it can be lazy loaded. See the [Lazy Popover](https://ariakit.org/examples/popover-lazy) example.
