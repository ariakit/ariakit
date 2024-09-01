---
"@ariakit/react-core": patch
"@ariakit/react": patch
"@ariakit/core": patch
---

Tabs inside animated Combobox or Select

When rendering [Tab](https://ariakit.org/components/tab) inside [Combobox](https://ariakit.org/components/combobox) or [Select](https://ariakit.org/components/select), it now waits for the closing animation to finish before restoring the tab with the selected item. This should prevent an inconsistent UI where the tab is restored immediately while the content is still animating out. See [Select with Combobox and Tabs
](https://ariakit.org/examples/select-combobox-tab).
