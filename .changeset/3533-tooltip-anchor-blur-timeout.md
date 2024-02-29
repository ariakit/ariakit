---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Tooltip behavior improvements

When using [Tooltip](https://ariakit.org/components/tooltip) components alongside elements that move focus upon clicking (like [`MenuButton`](https://ariakit.org/reference/menu-button), which moves focus to its [`Menu`](https://ariakit.org/reference/menu) when clicked), the tooltip will now stop from appearing after the user clicks the anchor element. It will only show when the mouse leaves and re-enters the anchor element.

This was already the case when tooltips had no [`timeout`](https://ariakit.org/reference/tooltip-provider#timeout). Now, the behavior is consistent regardless of the timeout value.
