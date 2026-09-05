---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Arrow keys in vertical menubars

Menus inside a [`Menubar`](https://ariakit.com/reference/menubar) with `orientation="vertical"` now open beside their [`MenuButton`](https://ariakit.com/reference/menu-button) instead of below it, and a [`MenuButtonArrow`](https://ariakit.com/reference/menu-button-arrow) on that button points to the same side. <kbd>ArrowRight</kbd> opens the menu of the focused menubar item and <kbd>ArrowLeft</kbd> closes it, while <kbd>ArrowDown</kbd> and <kbd>ArrowUp</kbd> keep moving between the items. An explicit [`placement`](https://ariakit.com/reference/menu-provider#placement) still takes precedence. In a right-to-left layout, pass `placement="left-start"` so the key that opens the menu keeps pointing away from the menubar.
