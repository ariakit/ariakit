---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Accessing selected tabs when disabled

A [Tab](https://ariakit.org/components/tab) component that is both selected and disabled will now remain accessible to keyboard focus even if the [`accessibleWhenDisabled`](https://ariakit.org/reference/tab#accessiblewhendisabled) prop is set to `false`. This ensures users can navigate to other tabs using the keyboard.
