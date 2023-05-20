# Dialog

<p data-description>
  Open a new window that can be either <a href="/apis/dialog#modal"><code>modal</code></a> or non-modal and optionally rendered in a React <a href="/apis/dialog#portal"><code>portal</code></a>. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/">WAI-ARIA Dialog Pattern</a>.
</p>

<a href="../examples/dialog/index.tsx" data-playground>Example</a>

## Examples

<div data-cards="examples">

- [](/examples/dialog-animated)
- [](/examples/dialog-framer-motion)
- [](/examples/dialog-menu)
- [](/examples/dialog-nested)
- [](/examples/dialog-react-router)
- [](/examples/dialog-next-router)

</div>

## API

<pre data-api>
<a href="/apis/dialog-store">useDialogStore</a>()

&lt;<a href="/apis/dialog-disclosure">DialogDisclosure</a> /&gt;
&lt;<a href="/apis/dialog">Dialog</a>&gt;
  &lt;<a href="/apis/dialog-dismiss">DialogDismiss</a> /&gt;
  &lt;<a href="/apis/dialog-heading">DialogHeading</a> /&gt;
  &lt;<a href="/apis/dialog-description">DialogDescription</a> /&gt;
&lt;/Dialog&gt;
</pre>

## Styling

### Styling the backdrop

You can style all the backdrop elements using the `[data-backdrop]` selector:

```css
[data-backdrop] {
  background-color: hsl(0 0 0 / 0.1);
}
```

To style the backdrop of a specific dialog, use the [`backdrop`](/apis/dialog#backdrop) prop:

```jsx
<Dialog backdrop={<div className="backdrop" />} />
```

### Scrollbar width

When the [`preventBodyScroll`](/apis/dialog#preventbodyscroll) prop is set to `true` (default for [`modal`](/apis/dialog#modal) dialogs), the scrollbar will be automatically hidden when the dialog is open. If your page contains `position:fixed` elements, you might need to modify their padding to compensate for the missing scrollbar width.

Ariakit automatically defines a `--scrollbar-width` CSS variable. You can apply this variable to adjust the `padding-right` of your fixed elements:

```css
.header {
  padding-right: calc(16px + var(--scrollbar-width, 0));
}
```

### Z-index

Modal dialogs are rendered at the end of the document using [React Portal](https://react.dev/reference/react-dom/createPortal), which means they will be rendered on top of all other elements by default.

However, if you set the [`portal`](/apis/dialog#portal) prop to `false` or use the `z-index` property on other elements, you might need to adjust the `z-index` of the dialog:

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
