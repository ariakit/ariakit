---
tags:
  - Toolbar
---

# Toolbar

<div data-description>

Group a set of related controls, reducing the number of tab stops in the keyboard interface. This component is based on the [WAI-ARIA Toolbar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).

</div>

<div data-tags></div>

<a href="../examples/toolbar/index.tsx" data-playground>Example</a>

## Examples

<div data-cards="examples">

- [](/examples/toolbar-select)

</div>

## API

```jsx
useToolbarStore()
useToolbarContext()

<ToolbarProvider>
  <Toolbar>
    <ToolbarContainer />
    <ToolbarInput />
    <ToolbarItem />
    <ToolbarSeparator />
  </Toolbar>
</ToolbarProvider>
```

## Related components

<div data-cards="components">

- [](/components/button)
- [](/components/menu)
- [](/components/tooltip)
- [](/components/composite)

</div>
