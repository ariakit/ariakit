---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Native browser search for `DisclosureContent` components

This version introduces experimental support for the browser's built-in "find in page" feature to interact with hidden [`DisclosureContent`](https://ariakit.org/reference/disclosure-content) components. This is automatically applied when the disclosure content element doesn't have an explicit `role` attribute, ensuring it doesn't affect other Ariakit components like [Dialog](https://ariakit.org/components/dialog) or [Menu](https://ariakit.org/components/menu).
