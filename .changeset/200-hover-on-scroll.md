---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`hoverOnScroll` prop on hovercard and tooltip anchors

The new [`hoverOnScroll`](https://ariakit.com/reference/hovercard-anchor#hoveronscroll) prop on [`HovercardAnchor`](https://ariakit.com/reference/hovercard-anchor) and [`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) lets a scroll under a resting mouse pointer count as hover. It's useful for a list of links that people scroll with the mouse wheel, such as a sidebar.

When a scroll moves the anchor under the pointer, the popup shows after the show timeout. If the popup is already open for another anchor of the same store, it moves to this anchor at once. When a scroll leaves neither the current anchor nor the popup under the pointer, the popup hides after the hide timeout.

Only a mouse pointer counts, after it moves and until the next press or key press. Modifier keys such as <kbd>Shift</kbd> don't end it, so a sideways scroll with <kbd>Shift</kbd> and the mouse wheel still counts. The prop also accepts a callback that receives the scroll event:

```tsx
<HovercardAnchor hoverOnScroll href="/components/button">
  Button
</HovercardAnchor>
<TooltipAnchor hoverOnScroll={(event) => event.target === sidebar}>
  Settings
</TooltipAnchor>
```

Thanks to [@ItaiYosephi](https://github.com/ItaiYosephi) for reporting the issue, [@vivshaw](https://github.com/vivshaw) for suggesting a configurable behavior, and [@gonzoblasco](https://github.com/gonzoblasco) for proposing a scroll listener approach.
