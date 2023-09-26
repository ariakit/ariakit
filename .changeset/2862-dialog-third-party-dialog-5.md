---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed an issue where the [Dialog](https://ariakit.org/components/dialog) component would automatically hide when parent dialogs closed.

You can now render nested dialogs in the React tree and keep them open independently, provided they're not unmounted.
