---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`Menu` and `Dialog` keep the combobox state when a close is prevented

When [`onClose`](https://ariakit.com/reference/dialog#onclose) prevents a close requested on a combobox store linked to a [`Menu`](https://ariakit.com/reference/menu) or [`Dialog`](https://ariakit.com/reference/dialog), such as when a [`ComboboxItem`](https://ariakit.com/reference/combobox-item) is clicked, the combobox now keeps its search value and active item. This applies to compositions such as a menu inside a [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider) and a combobox that receives the dialog store through the [`disclosure`](https://ariakit.com/reference/combobox-provider#disclosure) prop.

For these close requests, [`onClose`](https://ariakit.com/reference/dialog#onclose) now runs before the [`open`](https://ariakit.com/reference/use-dialog-store#open) state changes. Call `event.preventDefault()` to keep the popup open, since reopening it from [`onClose`](https://ariakit.com/reference/dialog#onclose) no longer has any effect.
