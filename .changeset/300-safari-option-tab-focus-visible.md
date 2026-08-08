---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Focusable`](https://ariakit.com/reference/focusable) treating Safari's `Option+Tab` navigation as a pointer interaction, so components built on it such as [`Button`](https://ariakit.com/reference/button) and [`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) now receive [`data-focus-visible`](https://ariakit.com/guide/styling#data-focus-visible) when focus reaches them that way. On macOS, `Option+Tab` is how Safari moves focus between all focusable elements while the system keyboard navigation setting is off.
