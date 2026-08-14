---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`SelectItem`](https://ariakit.com/reference/select-item) so an authored [`focusOnHover`](https://ariakit.com/reference/select-item#focusonhover) callback no longer runs while the select is closed, keeping its side effects from activating an item, changing the value, or moving focus in a collapsed always-visible [`SelectList`](https://ariakit.com/reference/select-list).
