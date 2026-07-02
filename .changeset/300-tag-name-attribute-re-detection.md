---
"@ariakit/react-utils": patch
---

Fixed `useTagName` and `useAttribute` to re-detect the element when it changes, instead of reading it only on mount. `useTagName` accepts the component's `render` prop as an optional third argument: it keys the re-detection and, when it's a host element, resolves the tag name during render, before the element is committed to the DOM.
