---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Server-rendered `Focusable` keyboard accessibility

[`Focusable`](https://ariakit.com/reference/focusable)-based components that render a non-native tag — such as the default `div` of [`Focusable`](https://ariakit.com/reference/focusable) itself, a virtual focus [`Composite`](https://ariakit.com/reference/composite) container, or [`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) — now server-render with the `tabindex="0"` fallback, so keyboard users can reach them before hydration completes or when JavaScript is disabled.

Disabled non-native components — including div-based items such as [`MenuItem`](https://ariakit.com/reference/menu-item), [`SelectItem`](https://ariakit.com/reference/select-item), and [`ComboboxItem`](https://ariakit.com/reference/combobox-item) — no longer server-render an invalid `disabled` attribute, which is silently removed on hydration but could match `[disabled]` CSS selectors until then. Native controls such as [`Button`](https://ariakit.com/reference/button) and [`Checkbox`](https://ariakit.com/reference/checkbox) keep their native `disabled` attribute in the server-rendered HTML.

In both cases, the server now renders the same attributes the client computes on its first render, keeping hydration consistent.
