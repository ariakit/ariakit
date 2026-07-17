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
      if (!suggestionsOpen) return;
      event.stopPropagation();
      closeSuggestions();
    }}
  />
</Dialog>
```

When the component handles an <kbd>Esc</kbd> event from its React subtree, it also stops the event at its boundary. This keeps an enclosing third-party React dialog with a bubble handler open while the Ariakit component closes.

An ancestor capture handler that stops <kbd>Esc</kbd> before it reaches the component owns the event. If [`hideOnEscape`](https://ariakit.com/reference/dialog#hideonescape) runs before such a handler, it can call `event.stopPropagation()` to keep the event from reaching it.

Thanks to [@boaz-wiz](https://github.com/boaz-wiz) for reporting the issue.
