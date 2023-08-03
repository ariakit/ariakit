---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed `Focusable` not triggering `onFocusVisible` (and thus not rendering the `data-focus-visible` attribute) when an element is focused after closing a dialog. ([#2691](https://github.com/ariakit/ariakit/pull/2691))
