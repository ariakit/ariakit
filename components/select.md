---
tags:
  - Select
  - Dropdowns
  - Form controls
---

# Select

<div data-description>

The Select components are deprecated. Use [Combobox](/components/combobox) with [`ComboboxSelect`](/reference/combobox-select) to select a value from a list of options.

</div>

<div data-tags></div>

<aside data-type="warn" title="Deprecated">

The Select APIs remain available for compatibility, but they will be removed in a future release. Use [`ComboboxProvider`](/reference/combobox-provider), [`ComboboxSelect`](/reference/combobox-select), and the corresponding Combobox components for new code. The replacement supports both standard and filterable selects through one store.

</aside>

<a href="../examples/select-combobox/index.react.tsx" data-playground>ComboboxSelect example</a>

## Migration

Replace Select components with their Combobox counterparts:

```jsx
<ComboboxProvider>
  <ComboboxSelectLabel>Favorite fruit</ComboboxSelectLabel>
  <ComboboxSelect>
    <ComboboxSelectedValue />
    <ComboboxSelectArrow />
  </ComboboxSelect>
  <ComboboxPopover>
    <ComboboxItem value="Apple" />
    <ComboboxItem value="Banana" />
  </ComboboxPopover>
</ComboboxProvider>
```

## Deprecated API

```jsx
useSelectStore()
useSelectContext()

<SelectProvider>
  <SelectLabel />
  <Select>
    <SelectValue />
    <SelectArrow />
  </Select>
  <SelectPopover>
    <SelectHeading />
    <SelectDismiss />
    <SelectList>
      <SelectGroup>
        <SelectGroupLabel />
        <SelectRow>
          <SelectItem>
            <SelectItemCheck />
            <SelectItemSelected />
          </SelectItem>
          <SelectSeparator />
        </SelectRow>
      </SelectGroup>
    </SelectList>
  </SelectPopover>
</SelectProvider>
```

## Styling

### Styling the active item

When browsing the list with a keyboard (or hovering over items with the mouse when the [`focusOnHover`](/reference/select-item#focusonhover) prop is `true`), the active item element will have a `data-active-item` attribute. You can use this attribute to style the active item:

```css
.select-item[data-active-item] {
  background-color: hsl(204 100% 40%);
  color: white;
}
```

Learn more on the [Styling](/guide/styling) guide.

## Related components

<div data-cards="components">

- [](/components/button)
- [](/components/combobox)
- [](/components/form)
- [](/components/menu)
- [](/components/popover)
- [](/components/composite)

</div>
