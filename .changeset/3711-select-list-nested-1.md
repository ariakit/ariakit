---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Nested `SelectList`

The [`SelectList`](https://ariakit.org/reference/select-list) component can now be nested within a [`SelectPopover`](https://ariakit.org/reference/select-popover). This lets you render additional elements inside the popover without breaking the accessibility tree. The ARIA roles will be automatically adjusted to ensure a valid accessibility tree:

```jsx {6-9}
<SelectProvider>
  <Select />
  <SelectPopover>
    <SelectHeading>Fruits</SelectHeading>
    <SelectDismiss />
    <SelectList>
      <SelectItem value="Apple" />
      <SelectItem value="Banana" />
    </SelectList>
  </SelectPopover>
</SelectProvider>
```
