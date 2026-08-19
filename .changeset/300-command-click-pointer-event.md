---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Keyboard activation dispatches a `PointerEvent`

The click that [`Command`](https://ariakit.com/reference/command) synthesizes for `Enter` and `Space` on an element that isn't natively clickable is now a `PointerEvent` built by the window that owns the element, reporting `pointerId: -1` and an empty `pointerType`. That is what Chromium, Firefox, and WebKit dispatch for a click no pointer caused, so a handler reading `event.pointerType` or checking `event instanceof PointerEvent` now sees the same shape it sees on a native button.

```tsx
<Ariakit.Button
  render={<div />}
  onClick={(event) => {
    // After Enter or Space: was false, now true.
    event.nativeEvent instanceof PointerEvent;
  }}
/>
```

This reaches every component built on [`Command`](https://ariakit.com/reference/command): [`Button`](https://ariakit.com/reference/button), [`Checkbox`](https://ariakit.com/reference/checkbox), [`Radio`](https://ariakit.com/reference/radio), [`CompositeItem`](https://ariakit.com/reference/composite-item), [`MenuItem`](https://ariakit.com/reference/menu-item), [`MenuItemCheckbox`](https://ariakit.com/reference/menu-item-checkbox), [`MenuItemRadio`](https://ariakit.com/reference/menu-item-radio), [`ComboboxItem`](https://ariakit.com/reference/combobox-item), [`SelectItem`](https://ariakit.com/reference/select-item), [`Tab`](https://ariakit.com/reference/tab), [`ToolbarItem`](https://ariakit.com/reference/toolbar-item), [`ToolbarContainer`](https://ariakit.com/reference/toolbar-container), [`Disclosure`](https://ariakit.com/reference/disclosure), [`DialogDisclosure`](https://ariakit.com/reference/dialog-disclosure), [`DialogDismiss`](https://ariakit.com/reference/dialog-dismiss), [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure), [`PopoverDismiss`](https://ariakit.com/reference/popover-dismiss), [`HovercardDisclosure`](https://ariakit.com/reference/hovercard-disclosure), [`HovercardDismiss`](https://ariakit.com/reference/hovercard-dismiss), [`MenuButton`](https://ariakit.com/reference/menu-button), [`MenuDismiss`](https://ariakit.com/reference/menu-dismiss), [`Select`](https://ariakit.com/reference/select), [`SelectDismiss`](https://ariakit.com/reference/select-dismiss), [`ComboboxSelect`](https://ariakit.com/reference/combobox-select), [`ComboboxCancel`](https://ariakit.com/reference/combobox-cancel), [`ComboboxDisclosure`](https://ariakit.com/reference/combobox-disclosure), [`ComboboxDismiss`](https://ariakit.com/reference/combobox-dismiss), [`FormSubmit`](https://ariakit.com/reference/form-submit), [`FormReset`](https://ariakit.com/reference/form-reset), [`FormPush`](https://ariakit.com/reference/form-push), [`FormRemove`](https://ariakit.com/reference/form-remove), [`FormCheckbox`](https://ariakit.com/reference/form-checkbox), and [`FormRadio`](https://ariakit.com/reference/form-radio).
