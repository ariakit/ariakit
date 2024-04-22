---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Opening `SelectPopover` on click

To ensure uniformity across all dropdown buttons in the library, the [`SelectPopover`](https://ariakit.org/reference/select-popover) now opens when you click on the [`Select`](https://ariakit.org/reference/select) component, instead of on mouse/touch/pointer down.

This change also resolves a problem where the `:active` state wouldn't be triggered on the select button due to a focus change on mousedown.
