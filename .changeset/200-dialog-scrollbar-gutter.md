---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Modal scroll locks use `scrollbar-gutter`

The [`Dialog`](https://ariakit.com/reference/dialog) component now locks page scroll in supporting browsers by setting `scrollbar-gutter: stable` and hiding overflow on the `html` element when [`preventBodyScroll`](https://ariakit.com/reference/dialog#preventbodyscroll) is enabled. This applies to [`modal`](https://ariakit.com/reference/dialog#modal) dialogs by default and to components built on [`Dialog`](https://ariakit.com/reference/dialog), including [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Tooltip`](https://ariakit.com/reference/tooltip), [`Menu`](https://ariakit.com/reference/menu), [`SelectPopover`](https://ariakit.com/reference/select-popover), and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover).

Pages that already set `scrollbar-gutter: stable` or `overflow-y: scroll` on `html` no longer shift when a modal opens, and Ariakit restores inline `html` overflow styles when it closes.

Fixed headers no longer need `--scrollbar-width` in browsers that support `scrollbar-gutter`:

```css
.header {
  position: fixed;
  padding-inline-end: 16px;
}
```

The `--scrollbar-width` CSS variable is now only defined in the fallback path for browsers without `scrollbar-gutter` support. If you still target those browsers, keep a length fallback when using the variable inside `calc()`:

```css
.header {
  padding-inline-end: calc(16px + var(--scrollbar-width, 0px));
}
```

Thanks to [@mirka](https://github.com/mirka) for reporting the issue, and [@benrodrs](https://github.com/benrodrs) for documenting a workaround that informed this solution.
