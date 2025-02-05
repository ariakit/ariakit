---
tags:
  - Plus
  - Disclosure
  - Animated
  - CSS transitions
---

# Animated Disclosure

<div data-description>

Applying plain CSS transitions to [Disclosure](/components/disclosure) components to animate the [`DisclosureContent`](/reference/disclosure-content) height as it expands and collapses.

</div>

<div data-tags></div>

<a href="./index.react.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/disclosure)

</div>

## Structuring the disclosure content markup

In this example, our goal is to animate the disclosure content height from `0` to `auto` and back. However, CSS does not yet support animating `auto` values. To circumvent this, we can arrange the disclosure content tree in a fashion that lets us animate the [`grid-template-rows`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows) property:

```jsx
<DisclosureContent className="content-wrapper">
  <div>
    <div className="content">
```

The intermediate `div` is essential because the immediate children of the grid (`.content-wrapper`) should not have any padding. This approach allows us to use the `.content` element to add padding to the disclosure content.

## Animating the disclosure content height with CSS

With the disclosure content structured as outlined earlier, we can animate the height of the `.content-wrapper` element using the [`grid-template-rows`](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows) property along with the [`[data-enter]`](/guide/styling#data-enter) selector applied by Ariakit:

```css
.content-wrapper {
  display: grid;
  transition: grid-template-rows 150ms;
  grid-template-rows: 0fr;

  /* This is equivalent to transitioning height from 0 to auto */
  &[data-enter] {
    grid-template-rows: 1fr;
  }

  /* The grid's direct children must have hidden overflow and no padding */
  > * {
    overflow: hidden;
    padding: 0;
  }
}
```

<aside data-type="note" title="Browser support">

Animating the `grid-template-rows` property is [supported in all modern browsers](https://caniuse.com/mdn-css_properties_grid-template-rows_animation). For older browsers, the disclosure content will simply appear and disappear without animation.

</aside>

## Rotating the disclosure arrow icon

We can animate the arrow icon with the [`rotate`](https://developer.mozilla.org/en-US/docs/Web/CSS/rotate) CSS property and the [`[aria-expanded]`](/guide/styling#aria-expanded) selector:

```css
.button > svg {
  transition: rotate 150ms;

  [aria-expanded="true"] > & {
    rotate: 180deg;
  }
}
```

The `aria-expanded` attribute is automatically applied by Ariakit to the [`Disclosure`](/reference/disclosure) component.

## Related examples

<div data-cards="examples">

- [](/examples/dialog-animated)
- [](/examples/select-animated)
- [](/examples/combobox-animated)
- [](/examples/tab-panel-animated)
- [](/examples/menu-framer-motion)
- [](/examples/tooltip-framer-motion)

</div>
