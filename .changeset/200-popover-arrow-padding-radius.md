---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Default `arrowPadding` based on the corner radius

When the [`arrowPadding`](https://ariakit.com/reference/popover#arrowpadding) prop isn't set, a [`PopoverArrow`](https://ariakit.com/reference/popover-arrow) now stays clear of the rounded corners on the side of the popover where it renders. Near the side of the viewport, the arrow of a rounded or pill-shaped popover no longer slides under the curve. In exchange, it may point a little farther from the anchor center than before.

The default padding follows the corner radius every time the popover position updates, and it's never less than 4 pixels, the previous default. With a `*-start` or `*-end` placement and a small anchor, such as an icon button, the popover may move farther past the edge of the anchor than before, so the arrow can keep pointing at the anchor.

```tsx
<Tooltip style={{ borderRadius: 9999 }}>
  <TooltipArrow />
  Add to favorites
</Tooltip>
```

An explicit [`arrowPadding`](https://ariakit.com/reference/popover#arrowpadding) value still takes precedence. This applies to all components built on [`Popover`](https://ariakit.com/reference/popover), including [`Hovercard`](https://ariakit.com/reference/hovercard), [`Tooltip`](https://ariakit.com/reference/tooltip), [`Menu`](https://ariakit.com/reference/menu), [`SelectPopover`](https://ariakit.com/reference/select-popover), and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover).
