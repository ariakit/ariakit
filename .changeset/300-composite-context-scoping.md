---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Composite items keep their enclosing store

Fixed [`CompositeItem`](https://ariakit.com/reference/composite-item) to register on the enclosing [`Composite`](https://ariakit.com/reference/composite) store when rendered as the same element as a component that sets its own composite context, such as a [`MenuButton`](https://ariakit.com/reference/menu-button) inside a [`MenuProvider`](https://ariakit.com/reference/menu-provider). This keeps the item reachable with the arrow keys in one- and two-dimensional composite widgets.

The [`CompositeItem`](https://ariakit.com/reference/composite-item) can now omit the explicit `store` prop and still register on the enclosing composite:

```tsx {5-7}
const composite = Ariakit.useCompositeStore();

<Ariakit.Composite store={composite}>
  <Ariakit.MenuProvider>
    <Ariakit.CompositeItem render={<Ariakit.MenuButton />}>
      Menu
    </Ariakit.CompositeItem>
    <Ariakit.Menu>
      <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
    </Ariakit.Menu>
  </Ariakit.MenuProvider>
</Ariakit.Composite>;
```
