---
tags:
  - Dialog
  - Button
---

# Dialog with scrollable backdrop

<div data-description>

Rendering a modal [Dialog](/components/dialog) component inside a scrollable backdrop container for dialogs that are
taller than the viewport.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)
- [](/components/button)

</div>

## Rendering a custom backdrop

In this example, the default backdrop element, which is typically rendered as a sibling, is disabled by setting the [`backdrop`](/reference/dialog#backdrop) prop to `false`. Then, the dialog is wrapped with a custom backdrop element using the [`render`](/apis/dialog#render) prop. The element that receives the `props` parameter becomes the dialog itself:

```jsx {4-6} "dialogProps"
<Dialog
  backdrop={false}
  render={(dialogProps) => (
    <div className="backdrop">
      <div {...dialogProps} />
    </div>
  )}
/>
```

This method allows us to render the backdrop as a parent of the dialog, but still inside the dialog portal. You can learn more about the `render` prop on the [Composition](/guide/composition) guide.

## Clicking outside

The Ariakit [Dialog](/components/dialog) component automatically closes when users click outside the dialog. This behavior is controlled by the [`hideOnInteractOutside`](/reference/dialog#hideoninteractoutside) prop, which is enabled by default.

However, Ariakit will make sure the dialog is not closed when users interact with the scrollbar on a container element.

<video gif="true" data-large src="/media/dialog-backdrop-scrollable.mp4" poster="/media/dialog-backdrop-scrollable.jpg" width="960" height="540"></video>

## Related examples

<div data-cards="examples">

- [](/examples/dialog-animated)
- [](/examples/dialog-framer-motion)
- [](/examples/dialog-menu)
- [](/examples/dialog-nested)
- [](/examples/dialog-hide-warning)

</div>
