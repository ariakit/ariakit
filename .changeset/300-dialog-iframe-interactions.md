---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Close popups across iframe boundaries

The [`Dialog`](https://ariakit.com/reference/dialog) component and components built on it, including [`Popover`](https://ariakit.com/reference/popover), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), [`SelectPopover`](https://ariakit.com/reference/select-popover), `CompositeOverflow`, [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), and [`Tooltip`](https://ariakit.com/reference/tooltip), now close when focus or pointer interactions move across same-origin iframe boundaries. The outside target retains focus, and [`hideOnInteractOutside`](https://ariakit.com/reference/dialog#hideoninteractoutside) receives the cross-document event with the iframe host as the target when browsers omit a native `focusin` event.

Thanks to [@emillaine](https://github.com/emillaine) for reporting the issue, [@ciampo](https://github.com/ciampo) for proposing the pointer behavior, and [@donaldpipowitch](https://github.com/donaldpipowitch) for providing the iframe click reproduction.
