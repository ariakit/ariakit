---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

`ComboboxItem` losing focus too early

Some tweaks were made to the [`ComboboxItem`](https://ariakit.org/reference/combobox-item) component to ensure it doesn't lose focus right after a click or <kbd>Escape</kbd> keystroke when the combobox popover is animated. This should avoid an inconsistent UI as the popover plays its exit animation.
