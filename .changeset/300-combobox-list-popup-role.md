---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Nested `ComboboxList` can own any popup role

[`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) drops its own `listbox` role when it contains a nested [`ComboboxList`](https://ariakit.com/reference/combobox-list), so the two elements never produce nested popup roles. This now happens whichever popup role the nested list carries, not only `listbox`.

```tsx
<Ariakit.ComboboxPopover>
  <div role="status">{matches.length} files</div>
  <Ariakit.ComboboxList role="tree" aria-label="Files">
    <Ariakit.ComboboxItem value="app.tsx" />
  </Ariakit.ComboboxList>
</Ariakit.ComboboxPopover>
```

The popover above used to render `role="listbox"` around the tree, which is invalid, and [`Combobox`](https://ariakit.com/reference/combobox) reported `aria-haspopup="listbox"`. It now renders as a dialog and reports `aria-haspopup="dialog"`.

[`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) also keeps its own popup role when an unrelated element with `role="listbox"` renders inside it. Only a real nested [`ComboboxList`](https://ariakit.com/reference/combobox-list) takes over the popup role now.
