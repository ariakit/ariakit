---
tags:
  - Menu
  - Dropdowns
---

# MenuItemCheckbox

<div data-description>

Rendering a dropdown <a href="/components/menu">Menu</a> using the <a href="/reference/menu-item-checkbox"><code>MenuItemCheckbox</code></a> component with the <a href="/reference/use-menu-store#values"><code>values</code></a> and <a href="/reference/use-menu-store#setvalues"><code>setValues</code></a> props from <a href="/reference/use-menu-store"><code>useMenuStore</code></a> to control the checked items.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/menu)

</div>

## Controlling the state with props

In this example, we created a higher-level abstraction of the `Menu` component that accepts the `values` and `onValuesChange` props to control the state of the menu store. These props are then passed to the [`useMenuStore`](/reference/use-menu-store) hook:

```js
function Menu({ values, onValuesChange }) {
  const menu = useMenuStore({ values, setValues: onValuesChange });
}
```

You can leverage this technique to create your own custom menu components tailored to your specific requirements. Learn more about controlling the state on the [Component stores](/guide/component-stores#providing-state-to-the-store) guide.

## Related examples

<div data-cards="examples">

- [](/examples/menu-tooltip)
- [](/examples/menu-framer-motion)

</div>
