---
tags:
  - Toolbar
  - Select
  - Dropdowns
---

# Toolbar with Select

<div data-description>

Rendering [Select](/components/select) as a [`ToolbarItem`](/reference/toolbar-item) inside a [Toolbar](/components/toolbar).

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/toolbar)
- [](/components/select)

</div>

## Composing `Select` and `ToolbarItem`

In this example, we use the [`render`](/reference/select#render) prop to combine [`Select`](/reference/select) and [`ToolbarItem`](/reference/toolbar-item) into a single element:

```jsx
<Select render={<ToolbarItem />}>
```

You can learn more about this pattern on the [Composition](/guide/composition) guide.

## Related examples

<div data-cards="examples">

- [](/examples/select-item-custom)

</div>
