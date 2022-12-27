# Select

<p data-description>
  Select a value from a list of options presented in a dropdown menu, similar to the native HTML select element. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/">WAI-ARIA Combobox Pattern</a>.
</p>

<a href="../examples/select/index.tsx" data-playground>Example</a>

## Installation

```sh
npm install ariakit
```

Learn more in [Getting started](/guide/getting-started).

## API

<pre data-api>
<a href="/api-reference/select-store">useSelectStore</a>()

&lt;<a href="/api-reference/select-label">SelectLabel</a> /&gt;
&lt;<a href="/api-reference/select">Select</a>&gt;
  &lt;<a href="/api-reference/select-arrow">SelectArrow</a> /&gt;
&lt;/Select&gt;
&lt;<a href="/api-reference/select-list">SelectList</a>|<a href="/api-reference/select-popover">SelectPopover</a>&gt;
  &lt;<a href="/api-reference/select-group">SelectGroup</a>&gt;
    &lt;<a href="/api-reference/select-group-label">SelectGroupLabel</a> /&gt;
    &lt;<a href="/api-reference/select-row">SelectRow</a>&gt;
      &lt;<a href="/api-reference/select-item">SelectItem</a>&gt;
        &lt;<a href="/api-reference/select-item-check">SelectItemCheck</a> /&gt;
      &lt;/SelectItem&gt;
      &lt;<a href="/api-reference/select-separator">SelectSeparator</a> /&gt;
    &lt;/SelectRow&gt;
  &lt;/SelectGroup&gt;
&lt;/SelectList|SelectPopover&gt;
</pre>

## Styling

### Styling the active item

When browsing the list with a keyboard (or hovering over items with the mouse when the [`focusOnHover`](/api-reference/select-item#focusonhover) prop is `true`), the active item element will have a `data-active-item` attribute. You can use this attribute to style the active item:

```css
.select-item[data-active-item] {
  background-color: hsl(204 100% 40%);
  color: white;
}
```

Learn more in [Styling](/guide/styling).
