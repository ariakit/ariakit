---
"@ariakit/components": patch
---

Menu placement in vertical menubars

`createMenuStore` now places a menu beside the items of a vertical [`menubar`](https://ariakit.com/reference/menu-provider#menubar) store, as it already did for a vertical [`parent`](https://ariakit.com/reference/menu-provider#parent) menu. The parent orientation no longer overwrites an explicit [`placement`](https://ariakit.com/reference/menu-provider#placement) while the store initializes.

```ts
const menubar = createMenubarStore({ orientation: "vertical" });
const menu = createMenuStore({ menubar });
// menu.getState().placement === "right-start"
```

The orientation is read once, when the store is created. A menu whose store is linked to another [`store`](https://ariakit.com/reference/menu-provider#store) created outside its parent menu or menubar keeps that store's placement. Earlier versions kept a menu with a parent menu in sync in both cases. A menubar or parent menu that turns vertical afterwards leaves its menus at `bottom-start`, with no arrow key that opens them, so write the placement alongside the orientation change:

```ts
const menubar = createMenubarStore({ orientation: "horizontal" });
const menu = createMenuStore({ menubar });

menubar.setState("orientation", "vertical");
menu.setState("placement", "right-start");
```

A menu that receives a [`combobox`](https://ariakit.com/reference/menu-provider#combobox) store now keeps its own placement instead of the one that store holds.
