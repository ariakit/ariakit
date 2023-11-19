---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Maintaining Popover tab order

[`Popover`](https://ariakit.org/reference/popover) and related components now automatically set the new [`preserveTabOrderAnchor`](https://ariakit.org/reference/portal#preservetaborderanchor) prop as the disclosure element.

This ensures that, when the [`portal`](https://ariakit.org/reference/popover#portal) prop is enabled, the tab order will be preserved from the disclosure to the content element even when the [`Popover`](https://ariakit.org/reference/popover) component is rendered in a different location in the React tree.
