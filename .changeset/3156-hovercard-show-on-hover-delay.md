---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Hovercard display timeout

The [Hovercard](https://ariakit.org/components/hovercard), [Menu](https://ariakit.org/components/menu), and [Tooltip](https://ariakit.org/components/tooltip) now display synchronously when the [`timeout`](https://ariakit.org/reference/hovercard-provider#timeout) or [`showTimeout`](https://ariakit.org/reference/hovercard-provider#showtimeout) state is set to `0`. This should stop submenus from vanishing for a few frames prior to displaying a new menu when hovering over menu items.
