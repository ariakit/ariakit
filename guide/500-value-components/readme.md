---
group: Advanced
---

# Value components

<div data-description>

Read and render a single value from an Ariakit provider or store without adding any element of your own.

</div>

<aside data-type="note" title="Component stores">

Value components are a convenience built on top of [component stores](/guide/component-stores). If you need arbitrary store fields or a computed selector, reach for [`useStoreState`](/guide/component-stores#reading-the-state) instead.

</aside>

## Overview

A value component reads one specific value from a provider or an explicit store and renders it. Unlike most Ariakit components, it:

- reads a single value from the nearest provider or from an explicit `store` prop
- adds no element of its own, though it may return text or arbitrary JSX
- exposes the value directly or through a `children` render function
- does not accept HTML props such as `className`, `style`, or `ref`, because it has no element to receive them

The stable public value components are [`SelectValue`](/reference/select-value) and [`ComboboxValue`](/reference/combobox-value), both exported from `@ariakit/react`.

This pattern is not inherently uncontrolled. Value components work with both controlled and uncontrolled providers and stores. Their main benefit is exposing state close to the JSX that needs it, without creating or passing a store solely for that purpose.

## Rendering a value directly

In its shortest form, a value component renders the current value as-is. No wrapper element is added around it, so it sits directly wherever you place it:

```jsx {3}
<SelectProvider defaultValue="Apple">
  <Select>
    <SelectValue fallback="Choose a fruit" />
    <SelectArrow />
  </Select>
  <SelectPopover>
    <SelectItem value="Apple" />
    <SelectItem value="Banana" />
    <SelectItem value="Orange" />
  </SelectPopover>
</SelectProvider>
```

[`SelectValue`](/reference/select-value) accepts a `fallback` prop that's used when the current value is an empty string or empty array.

## Rendering custom JSX

Pass a function as `children` to transform the value before rendering it. The function receives the current value and returns whatever you want to render:

```jsx {3-5}
<ComboboxProvider>
  <Combobox />
  <ComboboxValue>
    {(value) => <output>Current value: {value || "empty"}</output>}
  </ComboboxValue>
</ComboboxProvider>
```

Returning the raw value isn't always useful. For example, a multi-select renders its values with no separators between them. Use a function child whenever the value needs formatting or custom UI.

<aside data-type="note" title="The render prop">

The `children` render function is not the same as Ariakit's generic [`render`](/guide/composition) prop. The `render` prop composes or replaces an element; a value component has no element, so its function child is only about turning a value into JSX.

</aside>

## Choosing an API

Value components are one of several ways to work with Ariakit state. Pick based on what the surrounding code needs:

- Use a value component when a small section of JSX only needs one exposed value.
- Use controlled provider props when application state must own, persist, validate, or share the value. See [Component providers](/guide/component-providers).
- Use [`useStoreState`](/guide/component-stores#reading-the-state) when a component needs arbitrary store fields, multiple values, or a computed selector.
- Use `store.getState()` for event-only reads that shouldn't trigger a re-render.
- Use context hooks for lower-level descendant components that need access to the complete store.

## Next steps

Continue reading our [Guide](/guide) to learn more about Ariakit:

<div data-cards>

- [](/guide/component-providers)
- [](/guide/component-stores)

</div>
