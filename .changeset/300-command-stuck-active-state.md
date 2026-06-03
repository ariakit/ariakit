---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Command`](https://ariakit.com/reference/command) staying stuck in the active (`data-active`) state when the Space key is released while the Meta key is held, or after the element becomes disabled between keydown and keyup.
