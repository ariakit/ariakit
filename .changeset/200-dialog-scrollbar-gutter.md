---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Modal dialogs reserve the scrollbar space with CSS `scrollbar-gutter`

When [`preventBodyScroll`](https://ariakit.com/reference/dialog#preventbodyscroll) is enabled (the default for [`modal`](https://ariakit.com/reference/dialog#modal) dialogs), [`Dialog`](https://ariakit.com/reference/dialog) and components built on it, such as [`Popover`](https://ariakit.com/reference/popover), [`Menu`](https://ariakit.com/reference/menu), [`SelectPopover`](https://ariakit.com/reference/select-popover), and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), now lock the page scroll by setting `scrollbar-gutter: stable` and hiding the overflow on the `html` element, instead of measuring the scrollbar and padding the `body` element.

The reserved gutter keeps the page layout stable without any width compensation, so `position: fixed` elements no longer shift when a modal dialog opens and no longer need the `--scrollbar-width` CSS variable to adjust their padding. This also makes opening modal dialogs slightly faster and plays well with pages that already set `scrollbar-gutter: stable` themselves, which previously caused a layout shift. Note that on browsers with classic scrollbars, the reserved gutter shows the page background while the dialog is open, and `position: fixed` elements such as backdrops don't extend over it, just like they don't extend under the scrollbar when it's visible.

This fixes the layout shift that occurred when the `html` element had `overflow-y: scroll` with an always-visible scrollbar. Scroll locking now also covers pages that scroll through the `html` element itself (any non-visible `html` overflow), where hiding the `body` overflow alone had no effect, and the lock restores inline overflow styles the page set on the `html` element exactly as they were.

The `--scrollbar-width` CSS variable is now only defined when the scrollbar takes up space but `scrollbar-gutter` isn't supported (such as Safari before 18.2), where Ariakit falls back to the previous padding behavior. Styles that use the variable with a fallback value, like `padding-right: calc(16px + var(--scrollbar-width, 0px))`, keep working there and now resolve to the correct value in modern browsers as well. Note that a unitless `0` fallback is invalid inside `calc()`, so use `0px`.
