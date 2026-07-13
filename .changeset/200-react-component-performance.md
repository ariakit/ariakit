---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Improved React component performance

Improved [`Tab`](https://ariakit.com/reference/tab) performance during mounting, rendering, and navigation, and [`TabPanel`](https://ariakit.com/reference/tab-panel) performance during rendering and navigation. The mount improvements also apply to other native [`Focusable`](https://ariakit.com/reference/focusable) elements.

Default native [`Button`](https://ariakit.com/reference/button) and [`Command`](https://ariakit.com/reference/command) components now include `type="button"` in their initial markup. This avoids redundant post-mount updates and keeps server-rendered markup consistent during hydration.

This also applies to [`ComboboxCancel`](https://ariakit.com/reference/combobox-cancel), [`ComboboxDisclosure`](https://ariakit.com/reference/combobox-disclosure), [`CompositeItem`](https://ariakit.com/reference/composite-item), [`CompositeOverflowDisclosure`](https://ariakit.com/components/composite), [`DialogDisclosure`](https://ariakit.com/reference/dialog-disclosure), [`DialogDismiss`](https://ariakit.com/reference/dialog-dismiss), [`Disclosure`](https://ariakit.com/reference/disclosure), [`FormPush`](https://ariakit.com/reference/form-push), [`FormRemove`](https://ariakit.com/reference/form-remove), [`HovercardDisclosure`](https://ariakit.com/reference/hovercard-disclosure), [`HovercardDismiss`](https://ariakit.com/reference/hovercard-dismiss), [`MenuButton`](https://ariakit.com/reference/menu-button), [`MenuDismiss`](https://ariakit.com/reference/menu-dismiss), [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure), [`PopoverDismiss`](https://ariakit.com/reference/popover-dismiss), [`Select`](https://ariakit.com/reference/select), [`SelectDismiss`](https://ariakit.com/reference/select-dismiss), [`Tab`](https://ariakit.com/reference/tab), and [`ToolbarItem`](https://ariakit.com/reference/toolbar-item) when they render their default native button.
