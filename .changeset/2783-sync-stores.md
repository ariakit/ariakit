---
"@ariakit/core": patch
"@ariakit/react-core": patch
"@ariakit/react": patch
---

[`#2783`](https://github.com/ariakit/ariakit/pull/2783) Component store objects now contain properties for the composed stores passed to them as props. For instance, `useSelectStore({ combobox })` will return a `combobox` property if the `combobox` prop is specified.
