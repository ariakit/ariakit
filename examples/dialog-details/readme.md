---
tags:
  - Dialog
  - Button
---

# Dialog with details &amp; summary

<div data-description>

Combining [Dialog](/components/dialog) with the native [details element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details) in React so users can interact with it before JavaScript finishes loading.

</div>

<div data-tags></div>

<aside data-type="warn" title="Before you use this example">

This is not the best way to make modal dialogs accessible without JavaScript. Consider using a Router instead. Check out the [Dialog with React Router](/examples/dialog-react-router) and the [Dialog with Next.js App Router](/examples/dialog-next-router) examples.

</aside>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)
- [](/components/button)

</div>

## Styling

### Resetting the default styles

By default, browsers apply some default styles to the `details` element. We can reset them with the following CSS:

```css
.button {
  appearance: none;
}

.button::marker,
.button::-webkit-details-marker {
  display: none;
}
```

You can learn more about styling Ariakit components on the [Styling](/guide/styling) guide.

## Related examples

<div data-cards="examples">

- [](/examples/dialog-react-router)
- [](/examples/dialog-next-router)

</div>
