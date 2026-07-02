---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed arrow keys on a closed [`Select`](https://ariakit.com/reference/select) freezing the page when multiple [`SelectItem`](https://ariakit.com/reference/select-item) components without a [`value`](https://ariakit.com/reference/select-item#value) prop follow the active item, and moving to an item without a [`value`](https://ariakit.com/reference/select-item#value) when exactly one follows it. Items without a [`value`](https://ariakit.com/reference/select-item#value) are now skipped correctly, including when [`focusLoop`](https://ariakit.com/reference/select-provider#focusloop) wraps around the list.
