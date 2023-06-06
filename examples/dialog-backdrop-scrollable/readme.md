# Dialog with scrollable backdrop

<p data-description>
  Rendering a modal <a href="/components/dialog">Dialog</a> component inside a scrollable backdrop container for dialogs that are taller than the viewport.
</p>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)
- [](/components/button)

</div>

## Clicking outside

The Ariakit [Dialog](/components/dialog) component automatically closes when users click outside the dialog. This behavior is controlled by the [`hideOnInteractOutside`](/apis/dialog#hideoninteractoutside) prop, which is enabled by default.

However, Ariakit will make sure the dialog is not closed when users interact with the scrollbar on a container element.

<video gif="true" data-large src="/videos/dialog-backdrop-scrollable.mp4" poster="/videos/dialog-backdrop-scrollable.jpg" width="960" height="540"></video>

## Related examples

<div data-cards="examples">

- [](/examples/dialog-animated)
- [](/examples/dialog-framer-motion)
- [](/examples/dialog-menu)
- [](/examples/dialog-nested)

</div>
