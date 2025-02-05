---
tags:
  - Menu
  - Dropdowns
---

# Menu

<div data-description>

Access a set of commands within a dropdown menu. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/menu/">WAI-ARIA Menu Pattern</a> and the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/">WAI-ARIA Menu Button Pattern</a>.

</div>

<div data-tags></div>

<a href="../examples/menu/index.react.tsx" data-playground>Example</a>

## Examples

<div data-cards="examples">

- [](/examples/menu-nested)
- [](/examples/menu-item-checkbox)
- [](/examples/menu-framer-motion)
- [](/examples/menu-tooltip)

</div>

## API

```jsx
useMenuStore()
useMenuContext()

<MenuProvider>
  <MenuButton>
    <MenuButtonArrow />
  </MenuButton>
  <MenuList />
  <Menu>
    <MenuArrow />
    <MenuHeading />
    <MenuDescription />
    <MenuDismiss />
    <MenuGroup>
      <MenuGroupLabel />
      <MenuItem />
      <MenuItemCheckbox>
        <MenuItemCheck />
      </MenuItemCheckbox>
      <MenuItemRadio>
        <MenuItemCheck />
      </MenuItemRadio>
      <MenuSeparator />
    </MenuGroup>
  </Menu>
</MenuProvider>
```

## Styling

### Styling the active item

When browsing the list with a keyboard (or hovering over items with the mouse when the [`focusOnHover`](/reference/menu-item#focusonhover) prop is `true`), the active item element will have a `data-active-item` attribute. You can use this attribute to style the active item:

```css
.menu-item[data-active-item] {
  background-color: hsl(204 100% 40%);
  color: white;
}
```

Learn more on the [Styling](/guide/styling) guide.

## Should I use Menu or Select?

Because they behave similarly, it may not be obvious when to use `Menu` and when to use [Select](/components/select). Here are some guidelines to help you decide:

- Use `Select` when the purpose is to select a value from a list of options. For example, a dropdown to select a country from a list of countries.
- Use `Menu` when the purpose is to access a set of commands, actions, links, or settings. For example, a dropdown to access a set of commands to edit a document or a list of settings to configure part of an application.

Like the native `<select>` element, the [`Select`](/reference/select) button's text reflects the selected option (the value). The button should also have a label alongside the value, even if it's visually hidden. When the [`SelectPopover`](/reference/select-popover) opens, the selected item will be focused and brought into view. If your design requires these features, use `Select`.

On the other hand, [`MenuButton`](/reference/menu-button) can only display a label, not hold a value. The label is usually a static call to action. Opening the [`Menu`](/reference/menu) won't automatically focus on a checked [`MenuItemCheckbox`](/reference/menu-item-checkbox) or [`MenuItemRadio`](/reference/menu-item-radio), which are commonly used for settings.

## Related components

<div data-cards="components">

- [](/components/button)
- [](/components/checkbox)
- [](/components/menubar)
- [](/components/popover)
- [](/components/radio)
- [](/components/select)

</div>
