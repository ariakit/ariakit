---
tags:
  - Select
  - Animated
  - CSS transitions
  - Dropdowns
  - Form controls
---

# Animated Select

<div data-description>

Animating [Select](/components/select) using CSS transitions in React. The component waits for the transition to finish before completely hiding the popover.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/select)

</div>

## Setting the `animated` prop

When animating Select with CSS transitions, the [`animated`](/reference/select-provider#animated) prop must be set to `true` on the [`SelectProvider`](/reference/select-provider) component. This instructs Ariakit to assign the `data-enter` and `data-leave` attributes and wait for the transition to finish before hiding or unmounting the [`SelectPopover`](/reference/select-popover) component:

```jsx
<SelectProvider animated={true}>
```

## Conditional mouting

While not mandatory, in this example, we're using the `mounted` state to conditionally render the [`SelectPopover`](/reference/select-popover) component:

```jsx {4}
const [mounted, setMounted] = useState(open);

<SelectProvider animated setMounted={setMounted}>
  {mounted && <SelectPopover />}
</SelectProvider>
```

The `mounted` state derives from the [`open`](/reference/select-provider#open) state. They usually coincide. However, when the [`animated`](/reference/select-provider#animated) prop is set to `true`, these two values might differ. The `mounted` state remains `true` while [`SelectPopover`](/reference/select-popover) is animating out, which allows it to finish its transition before it is hidden or unmounted.

In short, the `mounted` state represents the following logic:

```js
const mounted = open || animating;
```

## Styling the animation

<aside data-type="note">

For more information on styling with Ariakit, refer to the [Styling](/guide/styling) guide.

</aside>

Use the `data-enter` and `data-leave` attributes to animate the [`SelectPopover`](/reference/select-popover) component using CSS transitions:

```css
.popover {
  opacity: 0;
  transition: opacity 150ms;
}

.popover[data-enter] {
  opacity: 1;
}
```
