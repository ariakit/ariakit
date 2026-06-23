---
"@ariakit/solid-utils": patch
"@ariakit/solid-components": patch
---

Fixed Solid component hooks such as [`VisuallyHidden`](https://ariakit.com/reference/visually-hidden) and [`FocusTrapRegion`](https://ariakit.com/reference/focus-trap-region) to return usable props when called without arguments, matching their optional props type.
