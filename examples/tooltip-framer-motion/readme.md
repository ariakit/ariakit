# Tooltip with Framer Motion

<p data-description>
  Abstracting <a href="/components/tooltip">Tooltip</a> into a reusable custom component that uses <a href="https://www.framer.com/motion/">Framer Motion</a> to create smooth initial and exit animations.
</p>

<a href="./index.tsx" data-playground>Example</a>

## Related components

<div data-cards="components">

- [](/components/tooltip)

</div>

## Related examples

<div data-cards="examples">

- [](/examples/menu-framer-motion)
- [](/examples/dialog-framer-motion)

</div>

## Composing with other components

In the custom `TooltipAnchor` component we've created in this example, we're exposing the [`render`](/apis/tooltip-anchor#render) prop to allow the user to render the anchor element however they want.

```jsx
<TooltipAnchor render={(props) => <a {...props} />} />
```

You can learn more about this pattern on the [Composition](/guide/composition#render) guide.
