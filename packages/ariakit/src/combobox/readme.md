# Combobox

<p class="description">
  Fill in a React input field with autocomplete &amp; autosuggest functionalities. Choose from a list of suggested values with full keyboard support. This component follows the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/combobox/">WAI-ARIA Combobox Pattern</a>.
</p>

<a href="./__examples__/combobox/index.tsx" data-playground>Example</a>

## Installation

```sh
npm install ariakit
```

Learn more in [Getting started](/guide/getting-started).

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
