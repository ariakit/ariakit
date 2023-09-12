---
tags:
  - Menu
  - Dropdowns
  - Abstracted examples
---

# MenuItemCheckbox

<div data-description>

Rendering a dropdown [Menu](/components/menu) using the [`MenuItemCheckbox`](/reference/menu-item-checkbox) component with the [`values`](/reference/menu-provider#values) and [`setValues`](/reference/menu-provider#setvalues) props from [`MenuProvider`](/reference/menu-provider) to control the checked items.


</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/menu)

</div>

## Controlling the state with props

In this example, we created a higher-level abstraction of the `Menu` component that accepts the `values` and `onValuesChange` props to control the state of the menu store. These props are then passed to the [`MenuProvider`](/reference/menu-provider) component:

```jsx
<MenuProvider values={props.values} setValues={props.onValuesChange}>
```

You can leverage this technique to create your own custom menu components tailored to your specific requirements. Learn more about controlling the state on the [Component providers](/guide/component-providers#controlled-state) guide.

## Related examples

<div data-cards="examples">

- [](/examples/menu-tooltip)
- [](/examples/menu-framer-motion)

</div>
