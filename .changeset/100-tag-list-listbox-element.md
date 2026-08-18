---
"@ariakit/react-components": minor
---

`TagList` renders the listbox element

**BREAKING** if you're rendering `TagInput` or any other element inside `TagList`.

The `TagList` component now renders the listbox element itself. Previously it rendered a separate, visually empty element that referenced the tags with `aria-owns`, which Safari does not support well.

Because the `listbox` role accepts only options as children, `TagInput` must now be rendered as a sibling of `TagList`. To keep styling them as a single input field, wrap both in a container element and give `TagList` a `display: contents` style.

Before:

```tsx
<TagList className="tag-list">
  {values.map((value) => (
    <Tag key={value} value={value}>
      {value}
    </Tag>
  ))}
  <TagInput />
</TagList>
```

After:

```tsx
<div className="tag-list">
  <TagList style={{ display: "contents" }}>
    {values.map((value) => (
      <Tag key={value} value={value}>
        {value}
      </Tag>
    ))}
  </TagList>
  <TagInput />
</div>
```

`TagInput` no longer inherits the store from `TagList`, so pass the `store` prop to it as well when you're not using `TagProvider`.

The tags must also be direct children of `TagList` now. `aria-owns` referenced them by id, so any element between `TagList` and the tags used to be irrelevant. Such an element can now stop assistive technologies from seeing the tags as options of the listbox.

Clicking `TagList` still focuses the input, but an element with a `display: contents` style generates no box, so it's never the target of a click. If you rely on clicking the empty area of the field, handle that on your container element.
