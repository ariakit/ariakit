---
tags:
  - Toolbar
  - Combobox
  - Dropdowns
---

# Toolbar with Select

<div data-description>

Rendering [`ComboboxSelect`](/reference/combobox-select) as a [`ToolbarItem`](/reference/toolbar-item) inside a [Toolbar](/components/toolbar).

</div>

<div data-tags></div>

<a href="./index.react.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/toolbar)
- [](/components/combobox)

</div>

## Composing `ComboboxSelect` and `ToolbarItem`

In this example, we use the [`render`](/reference/combobox-select#render) prop to combine [`ComboboxSelect`](/reference/combobox-select) and [`ToolbarItem`](/reference/toolbar-item) into a single element:

```jsx
<ComboboxSelect render={<ToolbarItem />}>
```

You can learn more about this pattern on the [Composition](/guide/composition) guide.

## Related examples

<div data-cards="examples">

- [](/examples/select-item-custom)

</div>
