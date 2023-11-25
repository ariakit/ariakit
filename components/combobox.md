---
tags:
  - Combobox
  - Dropdowns
  - Form controls
---

# Combobox

<div data-description>

Fill in a React input field with autocomplete &amp; autosuggest functionalities. Choose from a list of suggested values with full keyboard support. This component is based on the [WAI-ARIA Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

</div>

<div data-tags></div>

<a href="../examples/combobox/index.tsx" data-playground>Example</a>

## Examples

<div data-cards="examples">

- [](/examples/combobox-filtering)
- [](/examples/combobox-filtering-integrated)
- [](/examples/combobox-animated)
- [](/examples/combobox-group)
- [](/examples/combobox-disclosure)
- [](/examples/combobox-links)

</div>

## API

```jsx
useComboboxStore()
useComboboxContext()

<ComboboxProvider>
  <Combobox />
  <ComboboxCancel />
  <ComboboxDisclosure />
  <ComboboxList />
  <ComboboxPopover>
    <ComboboxGroup>
      <ComboboxGroupLabel />
      <ComboboxRow>
        <ComboboxItem>
          <ComboboxItemValue />
        </ComboboxItem>
        <ComboboxSeparator>
      </ComboboxRow>
    </ComboboxGroup>
  </ComboboxPopover>
</ComboboxProvider>
```

## Styling

### Styling the active item

When browsing the list with a keyboard (or hovering over items with the mouse when the [`focusOnHover`](/reference/combobox-item#focusonhover) prop is `true`), the active item element will have a `data-active-item` attribute. You can use this attribute to style the active item:

```css
.combobox-item[data-active-item] {
  background-color: hsl(204 100% 40%);
  color: white;
}
```

Learn more on the [Styling](/guide/styling) guide.

## Related components

<div data-cards="components">

- [](/components/button)
- [](/components/dialog)
- [](/components/form)
- [](/components/menu)
- [](/components/select)
- [](/components/composite)

</div>
