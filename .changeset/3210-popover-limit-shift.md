---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Limiting `slide` on popovers

When components like [Popover](https://ariakit.org/components/popover) and [Menu](https://ariakit.org/components/menu) with the [`slide`](https://ariakit.org/reference/popover#slide) prop are positioned to the right or left of the anchor element, they will now cease to slide across the screen, disengaged from the anchor element, upon reaching the edge of said element.
