# Menu with Framer Motion

<p data-description>
  Abstracting <a href="/components/menu">Menu</a> into a reusable dropdown menu component that uses <a href="https://www.framer.com/motion/">Framer Motion</a> to create smooth initial and exit animations.
</p>

<a href="./index.tsx" data-playground>Example</a>

## Controlling the Menu state

The [`useMenuStore`](/apis/menu-store) hook allows for the use of controlled props, such as [`open`](/apis/menu-store#open) and [`setOpen`](/apis/menu-store#setopen), which can be used to manage the state of the menu from outside the component. These props are compatible with React state and can be easily passed via props.

In this example, we use this method to expose a simpler API:

```jsx
function Menu({ open, setOpen }) {
  const menu = Ariakit.useMenuStore({ open, setOpen });
}
```

You can learn more about controlled state on the [Component stores](/guide/component-stores#controlled-state) guide.

## AnimatePresence

We use the [AnimatePresence](https://www.framer.com/motion/animate-presence/) component from Framer Motion to animate the Ariakit [Menu](/components/menu) component when it gets mounted and unmounted from the DOM.

```jsx
<AnimatePresence>
  {mounted && (
    <Ariakit.Menu store={menu} as={motion.div} {...otherProps}>
      {children}
    </Ariakit.Menu>
  )}
</AnimatePresence>
```

To dynamically render the menu component, you can use the [`mounted`](/apis/menu-store#mounted) state that can be retrieved from the store:

```jsx
const menu = Ariakit.useMenuStore({ open, setOpen });
const mounted = menu.useState("mounted");
```

You can learn more about reading state from the store on the [Component stores](/guide/component-stores#reading-the-state) guide.
