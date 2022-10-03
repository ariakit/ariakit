# Dialog

<p data-description>
  Open a new window that can be either <a href="/api-reference/dialog#modal"><code>modal</code></a> or non-modal and optionally rendered in a React <a href="/api-reference/dialog#portal"><code>portal</code></a>. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/">WAI-ARIA Dialog Pattern</a>.
</p>

<a href="./__examples__/dialog/index.tsx" data-playground>Example</a>

## Installation

```sh
npm install ariakit
```

Learn more in [Getting started](/guide/getting-started).

## API

<pre data-api>
<a href="/api-reference/dialog-state">useDialogState</a>()

&lt;<a href="/api-reference/dialog-disclosure">DialogDisclosure</a> /&gt;
&lt;<a href="/api-reference/dialog">Dialog</a>&gt;
  &lt;<a href="/api-reference/dialog-dismiss">DialogDismiss</a> /&gt;
  &lt;<a href="/api-reference/dialog-heading">DialogHeading</a> /&gt;
  &lt;<a href="/api-reference/dialog-description">DialogDescription</a> /&gt;
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

To style the backdrop of a specific dialog, use the [`backdropProps`](/api-reference/dialog#backdropprops) prop:

```jsx
<Dialog backdropProps={{ className: "my-backdrop" }} />
```

Alternatively, you can pass a custom component to the [`backdrop`](/api-reference/dialog#backdrop) prop.

### Scrollbar width

When the [`preventBodyScroll`](/api-reference/dialog#preventbodyscroll) prop is set to `true` (default on [`modal`](/api-reference/dialog#modal) dialogs), the scrollbar will be automatically hidden when the dialog is open. If you have `position:fixed` elements on your page, you may need to adjust their padding to account for the missing scrollbar width.

Ariakit automatically defines a `--scrollbar-width` CSS variable. You can use this variable to adjust the `padding-right` of your fixed elements:

```css
.header {
  padding-right: calc(16px + var(--scrollbar-width, 0));
}
```

Learn more in [Styling](/guide/styling#animations).
