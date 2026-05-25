---
"@ariakit/react-utils": patch
---

Fixed the internal `createElement` helper to skip the render prop when it is truthy but not a function. This prevents crashes such as `TypeError: render is not a function` when React 19 or Next.js 16 SSR hands the renderer a component reference (for example, a lazy or memo wrapper) instead of a React element.
