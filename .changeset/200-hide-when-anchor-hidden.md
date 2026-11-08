---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`hideWhenAnchorHidden` prop on popovers

The new [`hideWhenAnchorHidden`](https://ariakit.com/reference/popover#hidewhenanchorhidden) prop closes a popover when its anchor goes from visible to fully hidden by the scroll containers and other elements that clip it, on either axis. For example, a [`Tooltip`](https://ariakit.com/reference/tooltip) now closes when its [`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) scrolls out of a scrollable panel, instead of following the anchor outside the panel.

A partly visible anchor keeps the popover open, and so does a page scroll that moves the anchor out of the browser window. The popover also stays open while focus is inside it, including in a popup nested in it.

The prop defaults to `true` on [`Hovercard`](https://ariakit.com/reference/hovercard) and [`Tooltip`](https://ariakit.com/reference/tooltip). It defaults to `false` on [`Popover`](https://ariakit.com/reference/popover) and the other components built on it, such as [`Menu`](https://ariakit.com/reference/menu), [`SelectPopover`](https://ariakit.com/reference/select-popover), and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover).

```tsx
<Tooltip hideWhenAnchorHidden={false}>Add to bookmarks</Tooltip>
<Popover hideWhenAnchorHidden>Filter options</Popover>
```

Thanks to [@ItaiYosephi](https://github.com/ItaiYosephi) for reporting the issue, [@vivshaw](https://github.com/vivshaw) for providing a reproduction and suggesting a configurable behavior, and [@gonzoblasco](https://github.com/gonzoblasco) for proposing a scroll listener approach.
