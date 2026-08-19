---
"@ariakit/react-components": minor
---

`TagList` renders the listbox element

**BREAKING** if you're rendering `TagInput` or any other element inside `TagList`.

The `TagList` component now renders the listbox element itself. Previously it rendered a separate, visually empty element that referenced the tags with `aria-owns`, which Safari does not support well.

Because the `listbox` role accepts only options as children, `TagInput` must now be rendered as a sibling of `TagList`. The new `TagControl` component wraps both and is styled as the input field, and a `display: contents` style on `TagList` keeps the tags and the input on a single shared layout.

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
<TagControl className="tag-list">
  <TagList style={{ display: "contents" }}>
    {values.map((value) => (
      <Tag key={value} value={value}>
        {value}
      </Tag>
    ))}
  </TagList>
  <TagInput />
</TagControl>
```

`TagControl` takes over the two behaviors that used to live on `TagList`: clicking the field focuses the input, and the undo and redo shortcuts are handled there. Both now cover the tags and the input from a single element, so render a `TagControl` if you rely on either.

Because the tags and the input are separate widgets for assistive technologies, `TagControl` renders a `group` element that keeps them together, and the tag label component, renamed to `TagLabel` in this release, names the group along with the tag list and the input.

`TagInput` no longer inherits the store from `TagList`. It inherits it from `TagControl` instead, so pass the `store` prop to `TagControl` when you're not using `TagProvider`.

The tags must also be direct children of `TagList` now. `aria-owns` referenced them by id, so any element between `TagList` and the tags used to be irrelevant. Such an element can now stop assistive technologies from seeing the tags as options of the listbox.
