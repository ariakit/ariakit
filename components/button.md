# Button

<p data-description>
  Trigger an action or event, such as submitting a <a href="/components/form">Form</a>, opening a <a href="/components/dialog">Dialog</a>, canceling an action, or performing a delete operation in React. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/button/">WAI-ARIA Button Pattern</a>.
</p>

<a href="../examples/button/index.tsx" data-playground>Example</a>

## Installation

```sh
npm install ariakit
```

Learn more in [Getting started](/guide/getting-started).

## API

<pre data-api>
&lt;<a href="/api-reference/button">Button</a> /&gt;
</pre>

## Styling

### Styling the disabled state

When the [`accessibleWhenDisabled`](/api-reference/button#accessiblewhendisabled) prop is `true`, the button element won't have the `disabled` attribute. This is so users can still focus on the button while it's disabled. Because of this, you should use `aria-disabled` to style the disabled state:

```css
.button[aria-disabled="true"] {
  opacity: 0.5;
}
```

Learn more in [Styling](/guide/styling).
