# Combobox

<p data-description>
  Fill in a React input field with autocomplete &amp; autosuggest functionalities. Choose from a list of suggested values with full keyboard support. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/">WAI-ARIA Combobox Pattern</a>.
</p>

<a href="../examples/combobox/index.tsx" data-playground>Example</a>

## Installation

```sh
npm install ariakit
```

Learn more in [Getting started](/guide/getting-started).

## API

<pre data-api>
<a href="/api-reference/combobox-store">useComboboxStore</a>()

&lt;<a href="/api-reference/combobox">Combobox</a> /&gt;
&lt;<a href="/api-reference/combobox-cancel">ComboboxCancel</a> /&gt;
&lt;<a href="/api-reference/combobox-disclosure">ComboboxDisclosure</a> /&gt;
&lt;<a href="/api-reference/combobox-list">ComboboxList</a>|<a href="/api-reference/combobox-popover">ComboboxPopover</a>&gt;
  &lt;<a href="/api-reference/combobox-group">ComboboxGroup</a>&gt;
    &lt;<a href="/api-reference/combobox-group-label">ComboboxGroupLabel</a> /&gt;
    &lt;<a href="/api-reference/combobox-row">ComboboxRow</a>&gt;
      &lt;<a href="/api-reference/combobox-item">ComboboxItem</a>&gt;
        &lt;<a href="/api-reference/combobox-item-value">ComboboxItemValue</a> /&gt;
      &lt;/ComboboxItem&gt;
      &lt;<a href="/api-reference/combobox-separator">ComboboxSeparator</a> /&gt;
    &lt;/ComboboxRow&gt;
  &lt;/ComboboxGroup&gt;
&lt;/ComboboxList|ComboboxPopover&gt;
</pre>

## Styling

### Styling the active item

When browsing the list with a keyboard (or hovering over items with the mouse when the [`focusOnHover`](/api-reference/combobox-item#focusonhover) prop is `true`), the active item element will have a `data-active-item` attribute. You can use this attribute to style the active item:

```css
.combobox-item[data-active-item] {
  background-color: hsl(204 100% 40%);
  color: white;
}
```

Learn more in [Styling](/guide/styling).
