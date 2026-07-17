---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Handling <kbd>Esc</kbd> in nested widgets

The [`Dialog`](https://ariakit.com/reference/dialog) component and components that inherit its default <kbd>Esc</kbd> handling, including [`Popover`](https://ariakit.com/reference/popover), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), and [`SelectPopover`](https://ariakit.com/reference/select-popover), now let descendants call `event.stopPropagation()` on <kbd>Esc</kbd> without hiding the enclosing component. This allows a nested widget to dismiss itself first.

```tsx
<Dialog>
  <input
    onKeyDown={(event) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      closeSuggestions();
    }}
  />
</Dialog>
```

**Note:** If an ancestor capture handler stops an <kbd>Esc</kbd> event from inside before it reaches the enclosing component, that component now remains open.

Thanks to [@boaz-wiz](https://github.com/boaz-wiz) for reporting the issue.
