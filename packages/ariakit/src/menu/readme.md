# Menu

<p data-description>
  Access a set of commands within a menu bar or dropdown menu. This component follows the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/menu/">WAI-ARIA Menu Pattern</a> and the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/">WAI-ARIA Menu Button Pattern</a>.
</p>

<a href="./__examples__/menu/index.tsx" data-playground>Example</a>

## Installation

```sh
npm install ariakit
```

Learn more in [Getting started](/guide/getting-started).

## API

<pre data-api>
<a href="/api-reference/menu-state">useMenuState</a>()

&lt;<a href="/api-reference/menu-button">MenuButton</a>&gt;
  &lt;<a href="/api-reference/menu-button-arrow">MenuButtonArrow</a> /&gt;
&lt;/MenuButton&gt;
&lt;<a href="/api-reference/menu-list">MenuList</a>|<a href="/api-reference/menu">Menu</a>&gt;
  &lt;<a href="/api-reference/menu-arrow">MenuArrow</a> /&gt;
  &lt;<a href="/api-reference/menu-heading">MenuHeading</a> /&gt;
  &lt;<a href="/api-reference/menu-description">MenuDescription</a> /&gt;
  &lt;<a href="/api-reference/menu-dismiss">MenuDismiss</a> /&gt;
  &lt;<a href="/api-reference/menu-group">MenuGroup</a>&gt;
    &lt;<a href="/api-reference/menu-group-label">MenuGroupLabel</a> /&gt;
    &lt;<a href="/api-reference/menu-item">MenuItem</a> /&gt;
    &lt;<a href="/api-reference/menu-item-checkbox">MenuItemCheckbox</a>|<a href="/api-reference/menu-item-radio">MenuItemRadio</a>&gt;
      &lt;<a href="/api-reference/menu-item-check">MenuItemCheck</a> /&gt;
    &lt;/MenuItemCheckbox|MenuItemRadio&gt;
    &lt;<a href="/api-reference/menu-separator">MenuSeparator</a> /&gt;
  &lt;/MenuGroup&gt;
&lt;/MenuList|Menu&gt;

<a href="/api-reference/menu-bar-state">useMenuBarState</a>()

&lt;<a href="/api-reference/menu-bar">MenuBar</a> /&gt;
</pre>

## Styling

### Styling the active item

When browsing the list with a keyboard (or hovering over items with the mouse when the [`focusOnHover`](/api-reference/combobox-item#focusonhover) prop is `true`), the active item element will have a `data-active-item` attribute. You can use this attribute to style the active item:

```css
.menu-item[data-active-item] {
  background-color: hsl(204 100% 40%);
  color: white;
}
```

Learn more in [Styling](/guide/styling).

## Should I use Menu or Select?

Because they behave similarly, it may not be obvious when to use `Menu` and when to use [Select](/components/select). Here are some guidelines to help you decide:

- Use `Select` when the purpose is to select a value from a list of options. For example, a dropdown to select a country from a list of countries.
- Use `Menu` when the purpose is to access a set of commands, actions, or links. For example, a dropdown to access a set of commands to edit a document.

There are also some differences in how both components behave. Similarly to the native `<select>` element, the [`Select`](/api-reference/select) button's text will reflect the selected item. The button may also have a label in addition to the value. When the [`SelectPopover`](/api-reference/select-popover) opens, the selected item will be focused and brought into view.

On the other hand, [`MenuButton`](/api-reference/menu-button) can't hold a value, only a label, which won't reflect the active item. It's usually a static call to action.
