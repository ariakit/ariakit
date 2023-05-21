---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed `autoComplete` prop type on `Combobox` conflicting with the native `autoComplete` prop. ([#2428](https://github.com/ariakit/ariakit/pull/2428))

It's now possible to extend props from `InputHTMLAttributes` without having to `Omit` the `autoComplete` prop.
