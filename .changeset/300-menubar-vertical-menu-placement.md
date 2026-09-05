---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Arrow keys in vertical menubars

Menus inside a [`Menubar`](https://ariakit.com/reference/menubar) with `orientation="vertical"` now open beside their [`MenuButton`](https://ariakit.com/reference/menu-button) instead of below it, and a [`MenuButtonArrow`](https://ariakit.com/reference/menu-button-arrow) on that button points to the same side. <kbd>ArrowRight</kbd> opens the menu of the focused menubar item and <kbd>ArrowLeft</kbd> closes it, while <kbd>ArrowDown</kbd> and <kbd>ArrowUp</kbd> keep moving between the items. An explicit [`placement`](https://ariakit.com/reference/menu-provider#placement) still takes precedence. In a right-to-left layout, pass `placement="left-start"` so the key that opens the menu keeps pointing away from the menubar.

When the [`store`](https://ariakit.com/reference/menu-provider#store), [`parent`](https://ariakit.com/reference/menu-provider#parent), [`menubar`](https://ariakit.com/reference/menu-provider#menubar), [`combobox`](https://ariakit.com/reference/menu-provider#combobox), [`popover`](https://ariakit.com/reference/menu-provider#popover), or [`disclosure`](https://ariakit.com/reference/menu-provider#disclosure) prop of a menu inside a [`Menubar`](https://ariakit.com/reference/menubar) points to a different store, the recreated store derives its placement again from the menubar orientation, as a menu with a parent menu already did from its parent. To keep a specific placement across that change, pass a [`placement`](https://ariakit.com/reference/menu-provider#placement) prop. A placement written only with [`setState`](https://ariakit.com/reference/use-menu-store#setstate) is replaced by the derived one.
