---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

The `Checkbox` component now accepts `string[]` as the `value` prop. This is to conform with the native input prop type. If a string array is passed, it will be stringified, just like in the native input element. ([#2456](https://github.com/ariakit/ariakit/pull/2456))
