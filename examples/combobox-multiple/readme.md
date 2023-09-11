---
tags:
  - Combobox
  - Concurrent React
  - Search
  - Dropdowns
  - Form controls
  - Abstracted examples
---

# Multi-selectable Combobox

<div data-description>

Combining <a href="/components/combobox">Combobox</a> and <a href="/components/select">Select</a> to create an accessible multi-selectable search input in React.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/combobox)
- [](/components/select)

</div>

## Composition

In this example, we're combining both [Combobox](/components/combobox) and [Select](/components/select) by using the [`render`](/apis/combobox-popover#render) prop. This is because [`SelectList`](/reference/select-list) and [`SelectItem`](/reference/select-item) can manage multi-selection behavior:

```jsx
<ComboboxPopover render={<SelectList />} />
<SelectItem render={<ComboboxItem />}>
```

For more information about this pattern, refer to the [Composition](/guide/composition) guide.

## Related examples

<div data-cards="examples">

- [](/examples/combobox-filtering)
- [](/examples/combobox-group)
- [](/examples/combobox-disclosure)
- [](/examples/combobox-cancel)
- [](/examples/combobox-animated)

</div>
