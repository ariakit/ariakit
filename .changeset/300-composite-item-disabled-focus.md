---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Focus preserved when a composite item becomes disabled

A [`CompositeItem`](https://ariakit.com/reference/composite-item) that becomes [`disabled`](https://ariakit.com/reference/focusable#disabled) while it holds focus now stays focusable until focus moves elsewhere. Previously the focused element was removed from the focus order right away, through the native `disabled` attribute on elements that support it, such as a button or input, and through the loss of `tabindex` on elements that support neither native disabling nor native tabbing, such as a `div`. The browser then moved focus to the body and arrow keys stopped navigating the composite.

```tsx
<CompositeItem disabled={read} onClick={() => setRead(true)}>
  Mark as read
</CompositeItem>
```

The item is still exposed as disabled through `aria-disabled` and still cannot be activated. Once focus moves away it becomes fully disabled again and arrow keys skip it.

This applies to all components built on [`CompositeItem`](https://ariakit.com/reference/composite-item) that use roving focus, including [`ToolbarItem`](https://ariakit.com/reference/toolbar-item), [`ToolbarContainer`](https://ariakit.com/reference/toolbar-container), [`MenuItem`](https://ariakit.com/reference/menu-item), [`MenuItemCheckbox`](https://ariakit.com/reference/menu-item-checkbox), [`MenuItemRadio`](https://ariakit.com/reference/menu-item-radio), [`Radio`](https://ariakit.com/reference/radio), and [`FormRadio`](https://ariakit.com/reference/form-radio).

[`ComboboxItem`](https://ariakit.com/reference/combobox-item) and [`SelectItem`](https://ariakit.com/reference/select-item) are affected only when the composite opts out of [`virtualFocus`](https://ariakit.com/reference/composite-provider#virtualfocus), which they enable by default, since virtual focus keeps DOM focus on the composite element rather than the item. [`Tab`](https://ariakit.com/reference/tab) is unaffected, since it already keeps disabled tabs focusable by default. To opt out and keep the previous behavior, set [`accessibleWhenDisabled`](https://ariakit.com/reference/focusable#accessiblewhendisabled) to `false`.
