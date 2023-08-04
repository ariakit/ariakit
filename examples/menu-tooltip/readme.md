# Menu with Tooltip

<div data-description>

Rendering [Menu](/components/menu) with a [Tooltip](/components/tooltip) that appears when hovering over the [`MenuButton`](/reference/menu-button) component by combining it with the [`TooltipAnchor`](/reference/tooltip-anchor) component.

</div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/menu)
- [](/components/tooltip)

</div>

## Composing `MenuButton` and `TooltipAnchor`

In this example, we're combining [`MenuButton`](/reference/menu-button) and [`TooltipAnchor`](/reference/tooltip-anchor) using the [`render`](/apis/tooltip-anchor#render) prop to create a button that opens a menu when clicked and shows a tooltip when hovered.

```jsx
<TooltipAnchor render={<MenuButton />}>
```

You can learn more about this pattern on the [Composition](/guide/composition) guide.

## Related examples

<div data-cards="examples">

- [](/examples/menu-item-checkbox)
- [](/examples/dialog-menu)

</div>
