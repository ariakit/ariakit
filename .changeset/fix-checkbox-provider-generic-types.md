---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed TypeScript errors when wrapping [`CheckboxProvider`](https://ariakit.org/reference/checkbox-provider) in generic React components. This makes controlled and uncontrolled checkbox group wrappers type-check correctly without requiring non-null assertions on values such as `defaultValue`.
