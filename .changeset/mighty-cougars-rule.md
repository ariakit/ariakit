---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed infinite loop on `Portal` with the `preserveTabOrder` prop set to `true` when the portalled element is placed right after its original position in the React tree. ([#2279](https://github.com/ariakit/ariakit/pull/2279))
