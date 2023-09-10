---
tags:
  - Dialog
---

# Dialog

<div data-description>

Open a new window that can be either [`modal`](/reference/dialog#modal) or non-modal and optionally rendered in a React [`portal`](/reference/dialog#portal). This component is based on the [WAI-ARIA Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/).

</div>

<div data-tags></div>

<a href="../examples/dialog/index.tsx" data-playground>Example</a>

## Examples

<div data-cards="examples">

- [](/examples/dialog-animated)
- [](/examples/dialog-backdrop-scrollable)
- [](/examples/dialog-menu)
- [](/examples/dialog-nested)
- [](/examples/dialog-react-router)
- [](/examples/dialog-next-router)

</div>

## API

```jsx
useDialogStore()
useDialogContext()

<DialogProvider>
  <DialogDisclosure />
  <Dialog>
    <DialogDismiss />
    <DialogHeading />
    <DialogDescription />
  </Dialog>
</DialogProvider>
```

## Styling

### Styling the backdrop

You can style all the backdrop elements using the `[data-backdrop]` selector:

```css
[data-backdrop] {
  background-color: hsl(0 0 0 / 0.1);
}
```

To style the backdrop of a specific dialog, use the [`backdrop`](/reference/dialog#backdrop) prop:

```jsx
<Dialog backdrop={<div className="backdrop" />} />
```

### Scrollbar width

When the [`preventBodyScroll`](/reference/dialog#preventbodyscroll) prop is set to `true` (default for [`modal`](/reference/dialog#modal) dialogs), the scrollbar will be automatically hidden when the dialog is open. If your page contains `position:fixed` elements, you might need to modify their padding to compensate for the missing scrollbar width.

Ariakit automatically defines a `--scrollbar-width` CSS variable. You can apply this variable to adjust the `padding-right` of your fixed elements:

```css
.header {
  padding-right: calc(16px + var(--scrollbar-width, 0));
}
```

### Z-index

Modal dialogs are rendered at the end of the document using [React Portal](https://react.dev/reference/react-dom/createPortal), which means they will be rendered on top of all other elements by default.

However, if you set the [`portal`](/reference/dialog#portal) prop to `false` or use the `z-index` property on other elements, you might need to adjust the `z-index` of the dialog:

```css
.dialog {
  z-index: 100;
}
```

For more information on styling with Ariakit, refer to the [Styling](/guide/styling) guide.

## Related components

<div data-cards="components">

- [](/components/button)
- [](/components/disclosure)
- [](/components/heading)
- [](/components/popover)
- [](/components/focusable)
- [](/components/portal)

</div>
