---
"@ariakit/react-components": patch
---

Fixed [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) staying open when clicking a `Tag` from a tag list that mounted while the popup was open, which happened when the application passed its own `unstable_treeSnapshotKey` to the popup.
