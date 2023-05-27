# MenuItemCheckbox

<p data-description>
  Rendering a dropdown <a href="/components/menu">Menu</a> using the <a href="/apis/menu-item-checkbox"><code>MenuItemCheckbox</code></a> component with the <a href="/apis/menu-store#values"><code>values</code></a> and <a href="/apis/menu-store#setvalues"><code>setValues</code></a> props from <a href="/apis/menu-store"><code>useMenuStore</code></a> to control the checked items.
</p>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/menu)

</div>

## Controlling the state with props

In this example, we created a higher-level abstraction of the `Menu` component that accepts the `values` and `onValuesChange` props to control the state of the menu store. These props are then passed to the [`useMenuStore`](/apis/menu-store) hook:

```js
function Menu({ values, onValuesChange }) {
  const menu = useMenuStore({ values, setValues: onValuesChange });
}
```

You can leverage this technique to create your own custom menu components tailored to your specific requirements. Learn more about controlling the state on the [Component stores](/guide/component-stores#providing-state-to-the-store) guide.

## Related examples

<div data-cards="examples">

- [](/examples/menu-framer-motion/)

</div>
