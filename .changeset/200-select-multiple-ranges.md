---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Multi-value `Select` range selection

Multi-value [`Select`](https://ariakit.com/reference/select) components now extend their existing value arrays with Shift-click and Shift with the arrow keys. Unmodified activation keeps toggling one [`SelectItem`](https://ariakit.com/reference/select-item), and no item composition is required.

```tsx
<SelectProvider defaultValue={[]}>
  <Select />
  <SelectPopover>
    <SelectItem value="Compass" />
    <SelectItem value="Headlamp" />
  </SelectPopover>
</SelectProvider>
```
