---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Typeahead on unmounted composite items

The [`CompositeTypeahead`](https://ariakit.org/reference/composite-typeahead) component, used by composite components such as [Select](https://ariakit.org/components/select), will now take into account the `value` property for each item provided to the [`items`](https://ariakit.org/reference/select-provider#items) or [`defaultItems`](https://ariakit.org/reference/select-provider#defaultitems) props.

This allows composite components to handle typeahead functionality more efficiently when the composite items are rendered, for example, in a disclosure content component with the [`unmountOnHide`](https://ariakit.org/reference/select-popover#unmountonhide) prop.

The following code will render a custom select widget that supports typeahead functionality even when [`SelectPopover`](https://ariakit.org/reference/select-popover) is hidden/unmounted:

```tsx "defaultItems" "unmountOnHide"
const baseId = useId();
const items = [
  { id: `${baseId}/apple`, value: "Apple" },
  { id: `${baseId}/banana`, value: "Banana" },
  { id: `${baseId}/grape`, value: "Grape", disabled: true },
  { id: `${baseId}/orange`, value: "Orange" },
] satisfies SelectItemProps[];

return (
  <SelectProvider defaultItems={items} defaultValue="Apple">
    <Select />
    <SelectPopover unmountOnHide>
      {items.map((item) => (
        <SelectItem key={item.id} {...item} />
      ))}
    </SelectPopover>
  </SelectProvider>
);
```
