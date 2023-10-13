---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

It's now possible to control the menu [`values`](https://ariakit.org/reference/menu-provider#values) state by passing the [`checked`](https://ariakit.org/reference/menu-item-checkbox#checked), [`defaultChecked`](https://ariakit.org/reference/menu-item-checkbox#defaultchecked) and [`onChange`](https://ariakit.org/reference/menu-item-checkbox#onchange) props to [`MenuItemCheckbox`](https://ariakit.org/reference/menu-item-checkbox) and [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio):

```jsx
<MenuProvider setValue={console.log}>
  <Menu>
    <MenuItemCheckbox name="fruits" value="Apple" />
    <MenuItemCheckbox name="fruits" value="Banana" defaultChecked />
    <MenuItemCheckbox name="fruits" value="Orange" />
  </Menu>
</MenuProvider>
```
