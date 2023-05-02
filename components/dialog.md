# Dialog

<p data-description>
  Open a new window that can be either <a href="/apis/dialog#modal"><code>modal</code></a> or non-modal and optionally rendered in a React <a href="/apis/dialog#portal"><code>portal</code></a>. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/">WAI-ARIA Dialog Pattern</a>.
</p>

<a href="../examples/dialog/index.tsx" data-playground>Example</a>

## Installation

```sh
npm i @ariakit/react
```

Learn more on the [Getting started](/guide/getting-started) guide.

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

To style the backdrop of a specific dialog, use the [`backdropProps`](/apis/dialog#backdropprops) prop:

```jsx
<Dialog backdropProps={{ className: "my-backdrop" }} />
```

Alternatively, you can pass a custom component to the [`backdrop`](/apis/dialog#backdrop) prop.

### Scrollbar width

When the [`preventBodyScroll`](/apis/dialog#preventbodyscroll) prop is set to `true` (default for [`modal`](/apis/dialog#modal) dialogs), the scrollbar will be automatically hidden when the dialog is open. If your page contains `position:fixed` elements, you might need to modify their padding to compensate for the missing scrollbar width.

Ariakit automatically defines a `--scrollbar-width` CSS variable. You can apply this variable to adjust the `padding-right` of your fixed elements:

```css
.header {
  padding-right: calc(16px + var(--scrollbar-width, 0));
}
```

For more information on styling with Ariakit, refer to the [Styling](/guide/styling) guide.
