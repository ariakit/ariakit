---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

New `SelectItemSelected` component

The new [`SelectItemSelected`](https://ariakit.com/reference/select-item-selected) value component exposes whether the closest [`SelectItem`](https://ariakit.com/reference/select-item) is selected through a required function child.

```tsx
<SelectItem value="Apple">
  <SelectItemSelected>
    {(selected) => (selected ? <CheckIcon /> : null)}
  </SelectItemSelected>
  Apple
</SelectItem>
```

Thanks to [@jonrimmer](https://github.com/jonrimmer) for proposing the feature, and [@georgekaran](https://github.com/georgekaran) for the investigation and implementation work that informed this solution.
