---
"@ariakit/react": patch
"@ariakit/react-components": patch
---

`ComboboxSelect` popups take focus on every open

A [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) that belongs to a [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) now takes focus whenever it opens, including when it is opened with [`defaultOpen`](https://ariakit.com/reference/combobox-provider#defaultopen) or programmatically while focus is somewhere else. Previously, unless the popup rendered a [`ComboboxInput`](https://ariakit.com/reference/combobox-input), it took focus only when the select itself was focused, so a popup that opened any other way left the user outside an open listbox, with no keyboard navigation and with the selected item still out of view.

```tsx
<ComboboxProvider defaultOpen defaultSelectedValue="Watermelon">
  <ComboboxSelect />
  <ComboboxPopover>
    <ComboboxItem value="Apple" />
    {/* Watermelon becomes the active item, ready for the arrow keys. */}
    <ComboboxItem value="Watermelon" />
  </ComboboxPopover>
</ComboboxProvider>
```

A popup that opens outside the viewport is now scrolled into view, since taking focus is what moves the page. To keep a popup from taking focus, and with it the scroll, pass [`autoFocusOnShow={false}`](https://ariakit.com/reference/combobox-popover#autofocusonshow).
