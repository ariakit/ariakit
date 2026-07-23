---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Close popups across existing same-origin iframe boundaries

The [`Dialog`](https://ariakit.com/reference/dialog), [`Popover`](https://ariakit.com/reference/popover), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`SelectPopover`](https://ariakit.com/reference/select-popover), and [`Tooltip`](https://ariakit.com/reference/tooltip) components now close when focus moves from an embedded same-origin popup to an ancestor document or a pointer interaction occurs in an existing sibling frame. Focus stays on the outside target, interactions in contained frames stay inside, and true browser or application window blur remains ignored.

Thanks to [@emillaine](https://github.com/emillaine) for reporting the issue, [@ciampo](https://github.com/ciampo) for proposing the pointer behavior, and [@donaldpipowitch](https://github.com/donaldpipowitch) for providing the iframe click reproduction.
