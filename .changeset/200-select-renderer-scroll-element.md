---
"@ariakit/react-components": patch
---

Explicit scroll elements for collection renderers

Added the `scrollElement` prop to collection renderers, including `CompositeRenderer` and `SelectRenderer`. This prop can be an element, a React ref, or a function that resolves the element whose viewport controls rendering.

Use this prop when the scrolling ancestor cannot be detected automatically, such as when an `overflow: auto` element does not overflow until asynchronous items are loaded:

```tsx
const scrollElementRef = useRef<HTMLDivElement>(null);

<div ref={scrollElementRef} className="scroller">
  <SelectRenderer scrollElement={scrollElementRef} items={items}>
    {(item) => <SelectItem key={item.id} {...item} />}
  </SelectRenderer>
</div>;
```

Nested renderers using the same store inherit an explicitly provided scroll element unless they provide their own. When the prop is omitted, each renderer detects its closest scrolling ancestor. Thanks to [@ItaiYosephi](https://github.com/ItaiYosephi) for reporting the issue.
