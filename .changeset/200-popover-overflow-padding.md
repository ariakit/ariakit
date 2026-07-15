---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Added support for side-specific `overflowPadding`

The [`overflowPadding`](https://ariakit.com/reference/popover#overflowpadding) prop now accepts a number or an object with independent `top`, `right`, `bottom`, and `left` values. This applies to [`Popover`](https://ariakit.com/reference/popover) and components built on it, including [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), [`SelectPopover`](https://ariakit.com/reference/select-popover), `CompositeOverflow`, [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), and [`Tooltip`](https://ariakit.com/reference/tooltip):

```tsx
<ComboboxPopover overflowPadding={{ top: 24, right: 32, left: 16 }} />
```

When [`overflowPadding`](https://ariakit.com/reference/popover#overflowpadding) is an object, the [`--popover-overflow-padding`](https://ariakit.com/guide/styling#--popover-overflow-padding) CSS variable uses the larger of the horizontal `left` and `right` values, treating omitted sides as `0`.

Thanks to [@mririgoyen](https://github.com/mririgoyen) for reporting the issue, and [@georgekaran](https://github.com/georgekaran) for providing the approach that informed this solution.
