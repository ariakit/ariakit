---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

New Select components

Two new components have been added to the [Select](https://ariakit.org/components/select) module: [`SelectHeading`](https://ariakit.org/reference/select-heading) and [`SelectDismiss`](https://ariakit.org/reference/select-dismiss).

You can use them alongside [`SelectList`](https://ariakit.org/reference/select-list) to add a heading and a dismiss button to the select popover:

```jsx {4,5}
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
