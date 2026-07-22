---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Close popups across iframe boundaries

The [`Dialog`](https://ariakit.com/reference/dialog) component and components built on it, including [`Popover`](https://ariakit.com/reference/popover), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), [`SelectPopover`](https://ariakit.com/reference/select-popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), and [`Tooltip`](https://ariakit.com/reference/tooltip), now close when focus or pointer interactions move across same-origin iframe boundaries. The outside target retains focus, and [`hideOnInteractOutside`](https://ariakit.com/reference/dialog#hideoninteractoutside) receives the native cross-document event. When browsers omit `focusin` on a focused iframe host, the callback receives the child window's native `focus` event after dispatch, with `currentTarget` set to `null` and an empty `composedPath()`.

Thanks to [@emillaine](https://github.com/emillaine) for reporting the issue, [@ciampo](https://github.com/ciampo) for proposing the pointer behavior, and [@donaldpipowitch](https://github.com/donaldpipowitch) for providing the iframe click reproduction.
