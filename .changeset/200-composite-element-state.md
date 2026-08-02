---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Composite element state

Composite stores now expose the [`compositeElement`](https://ariakit.com/reference/use-composite-store) state and [`setCompositeElement`](https://ariakit.com/reference/use-composite-store#setcompositeelement) method. The new [`compositeElementInFocusOrder`](https://ariakit.com/reference/composite-provider#compositeelementinfocusorder) option controls whether arrow key navigation can move focus to the composite element:

```tsx
<CompositeProvider compositeElementInFocusOrder>
  <Composite>
    <CompositeItem>Item 1</CompositeItem>
    <CompositeItem>Item 2</CompositeItem>
  </Composite>
</CompositeProvider>
```

These APIs are also available on stores for [`Combobox`](https://ariakit.com/reference/combobox), [`Menu`](https://ariakit.com/reference/menu), [`Menubar`](https://ariakit.com/reference/menubar), [`Radio`](https://ariakit.com/reference/radio), [`Select`](https://ariakit.com/reference/select), [`Tab`](https://ariakit.com/reference/tab), and [`Toolbar`](https://ariakit.com/reference/toolbar) widgets.
