---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`hideOnClick` prop on hovercard and tooltip anchors

The new [`hideOnClick`](https://ariakit.com/reference/hovercard-anchor#hideonclick) prop on [`HovercardAnchor`](https://ariakit.com/reference/hovercard-anchor) and [`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) hides the popup when people click the anchor. It's useful for a link whose page loads next, such as a link in a sidebar. The prop defaults to `false`, and it also accepts a callback that receives the click event:

```tsx
<HovercardAnchor hideOnClick href="/components/button">
  Button
</HovercardAnchor>
```

The popup stays open when the click event is prevented, or when a modifier key opens the link in a new tab or downloads it.

When a popup closes while the mouse rests on its anchor, such as after a click with [`hideOnClick`](https://ariakit.com/reference/hovercard-anchor#hideonclick) or after <kbd>Escape</kbd>, moving the mouse on the anchor doesn't show the popup again until the mouse leaves the anchor. The same applies after focus leaves the anchor while the mouse rests on it. [`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) already did this, and [`HovercardAnchor`](https://ariakit.com/reference/hovercard-anchor) now does too.

[`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) also shows its tooltip on a mouse move that has no mouse enter before it, such as on a page that hydrates under a resting mouse, as [`HovercardAnchor`](https://ariakit.com/reference/hovercard-anchor) already did.
