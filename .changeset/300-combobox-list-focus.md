---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`ComboboxList`](https://ariakit.com/reference/combobox-list) to render with `tabIndex={-1}` by default, preventing scrollable listboxes from becoming unintended Tab stops in Chromium and Firefox. An explicit `tabIndex` prop on `ComboboxList` continues to override the default.

When the list itself receives focus, focus now moves back to the combobox control. This behavior was previously limited to [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover).
