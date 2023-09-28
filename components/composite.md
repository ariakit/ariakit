---
tags:
  - Composite
---

# Composite

<div data-description>

Provide a single tab stop on the page and navigate through the focusable descendants with arrow keys. This abstract component is based on the [WAI-ARIA Composite Role](https://w3c.github.io/aria/#composite).

</div>

<div data-tags></div>

## API

```jsx
useCompositeStore()
useCompositeContext()

<CompositeProvider>
  <Composite>
    <CompositeGroup>
      <CompositeGroupLabel />
      <CompositeRow>
        <CompositeHover />
        <CompositeItem />
        <CompositeSeparator />
      </CompositeRow>
    </CompositeGroup>
  </Composite>
  <CompositeTypeahead />
</CompositeProvider>
```
