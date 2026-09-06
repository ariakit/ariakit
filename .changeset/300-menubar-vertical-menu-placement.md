---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Arrow keys in vertical menubars

Menus inside a [`Menubar`](https://ariakit.com/reference/menubar) with `orientation="vertical"` now open beside their [`MenuButton`](https://ariakit.com/reference/menu-button) instead of below it, and a [`MenuButtonArrow`](https://ariakit.com/reference/menu-button-arrow) on that button points to the same side. <kbd>ArrowRight</kbd> opens the menu of the focused menubar item and <kbd>ArrowLeft</kbd> closes it, while <kbd>ArrowDown</kbd> and <kbd>ArrowUp</kbd> keep moving between the items. In a right-to-left layout, pass `placement="left-start"` so the key that opens the menu keeps pointing away from the menubar.

A menu settles its placement in this order: an explicit [`placement`](https://ariakit.com/reference/menu-provider#placement), the placement that a linked [`store`](https://ariakit.com/reference/menu-provider#store) or [`popover`](https://ariakit.com/reference/menu-provider#popover) store already holds, `right-start` when the [`parent`](https://ariakit.com/reference/menu-provider#parent) menu or [`menubar`](https://ariakit.com/reference/menu-provider#menubar) is vertical, and `bottom-start` otherwise. Everything but a linked [`popover`](https://ariakit.com/reference/menu-provider#popover) store is decided when the menu store is created, and that store applies its own placement a moment later, while the menu store initializes. A [`combobox`](https://ariakit.com/reference/menu-provider#combobox) store no longer takes part, so set the placement on the menu rather than on a [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider) that wraps it.

Pass a [`placement`](https://ariakit.com/reference/menu-provider#placement) whenever the menu cannot settle the right one at that moment. Menus inside a [`Menubar`](https://ariakit.com/reference/menubar) whose [`orientation`](https://ariakit.com/reference/menubar#orientation) becomes vertical after they are mounted keep `bottom-start`, so they stay below their items and no arrow key opens them. A menu keeps its placement the same way when its linked store was created outside its parent menu or menubar, and when its store is created again because a linked store changed identity. A submenu followed its parent menu in each of these cases in earlier versions.
