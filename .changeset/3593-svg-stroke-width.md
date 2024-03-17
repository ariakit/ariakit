---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Better SVG strokes

The `strokeWidth` property on SVG elements rendered by [`CheckboxCheck`](https://ariakit.org/reference/checkbox-check), [`ComboboxCancel`](https://ariakit.org/reference/combobox-cancel), [`ComboboxDisclosure`](https://ariakit.org/reference/combobox-disclosure), [`DialogDismiss`](https://ariakit.org/reference/dialog-dismiss), [`HovercardDisclosure`](https://ariakit.org/reference/hovercard-disclosure), [`PopoverDisclosureArrow`](https://ariakit.org/reference/popover-disclosure-arrow), and all components that use any of these now defaults to `1.5px` instead of `1.5pt`. This should make the strokes slightly thinner.

Remember, you can always override the SVG element rendered by these components by rendering custom `children`.
