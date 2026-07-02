---
"@ariakit/react-utils": patch
---

Fixed `useTagName` and `useAttribute` to re-detect the element when it changes, instead of reading it only on mount. `useTagName` also accepts the component's `render` prop as an optional third argument, so a host element render prop resolves the tag name during render, before the element is committed to the DOM.
