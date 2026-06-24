---
"@ariakit/utils": patch
---

Fixed the `fallbackToFocusable` option of `getFirstTabbableIn`, `getAllTabbableIn`, and `getLastTabbableIn` to return focusable elements instead of every raw selector match, so the fallback no longer yields non-focusable elements such as a `display: none` input.
