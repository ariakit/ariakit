---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

The `Combobox` component now properly disables the `autoSelect` behavior when the user is scrolling through the list of options. This should prevent issues when scrolling virtualized or infinite lists. ([#2617](https://github.com/ariakit/ariakit/pull/2617))
