# Tooltip

<p data-description>
  Display information related to an anchor element when the element receives keyboard focus or the mouse hovers over it. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/">WAI-ARIA Tooltip Pattern</a>.
</p>

<a href="../examples/tooltip/index.tsx" data-playground>Example</a>

## Examples

<div data-cards="examples">

- [](/examples/tooltip-framer-motion)

</div>

## API

<pre data-api>
<a href="/apis/tooltip-store">useTooltipStore</a>()

&lt;<a href="/apis/tooltip-anchor">TooltipAnchor</a> /&gt;
&lt;<a href="/apis/tooltip">Tooltip</a>&gt;
  &lt;<a href="/apis/tooltip-arrow">TooltipArrow</a> /&gt;
&lt;/Tooltip&gt;
</pre>

## Tooltips are descriptions

By default, tooltips describe the element they are attached to (the anchor element) and are referenced by the [`aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby) attribute.

You should make sure the anchor element has an accessible name, either by:

- Rendering a visible label or a [VisuallyHidden](/components/visually-hidden) text inside the anchor element.
- Using the [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label) or [`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby) attributes on the anchor element.

Alternatively, if you want to use the tooltip as a label, you must set the [`type`](/apis/tooltip-store#type) prop on the [`useTooltipStore`](/apis/tooltip-store) hook to `label`:

```js
const tooltip = useTooltipStore({ type: "label" });
```

This will make the tooltip behave like a label and will use the `aria-labelledby` attribute on the anchor element. Additionally, the tooltip's `role` attribute will be set to `none`.
