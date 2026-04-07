---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog) focus restoration so closing by selecting an item, pressing Escape, or calling `store.hide()` scrolls the disclosure element into view, while clicking outside still avoids scrolling it into view.
