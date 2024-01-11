---
"@ariakit/core": minor
"@ariakit/react": minor
"@ariakit/react-core": minor
---

Composite widgets with `grid` role

**BREAKING** if you're manually setting the `role="grid"` prop on a composite widget.

Ariakit automatically assigns the `role` prop to all composite items to align with the container `role`. For example, if [`SelectPopover`](https://ariakit.org/reference/select-popover) has its `role` prop set to `listbox` (which is the default value), its owned [`SelectItem`](https://ariakit.org/reference/select-item) elements will automatically get their `role` prop set to `option`.

In previous versions, this was also valid for composite widgets with a `grid` role, where the composite item element would automatically be given the `role="gridcell"` prop. This is no longer applicable, and you're now required to manually assign the `role="gridcell"` prop to the composite item element.

Before:

```jsx
<SelectPopover role="grid">
  <SelectRow> {/* Automatically gets role="row" */}
    <SelectItem> {/* Automatically gets role="gridcell" */}
```

After:

```jsx
<SelectPopover role="grid">
  <SelectRow> {/* Still gets role="row" */}
    <SelectItem role="gridcell">
```

This change is due to the possibility of rendering a composite item component with a different role as a child of a static div with `role="gridcell"`, which is a valid and frequently used practice when using the `grid` role. As a result, you no longer have to manually adjust the `role` prop on the composite item component:

```jsx
<SelectPopover role="grid">
  <SelectRow>
    <div role="gridcell">
      <SelectItem render={<button />}>
```

Previously, you had to explicitly pass `role="button"` to the `SelectItem` component above, otherwise it would automatically receive `role="gridcell"`, leading to an invalid accessibility tree.
