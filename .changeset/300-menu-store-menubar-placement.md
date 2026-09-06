---
"@ariakit/components": patch
---

Menu placement in vertical menubars

`createMenuStore` now places a menu beside the items of a vertical [`menubar`](https://ariakit.com/reference/menu-provider#menubar) store, as it already did for a vertical [`parent`](https://ariakit.com/reference/menu-provider#parent) menu. It no longer subscribes to the orientation of that parent or menubar, so it also stops overwriting an explicit [`placement`](https://ariakit.com/reference/menu-provider#placement) on a nested menu while the store initializes.

The store settles its own placement when it is created: an explicit [`placement`](https://ariakit.com/reference/menu-provider#placement) first, then the placement a linked [`store`](https://ariakit.com/reference/menu-provider#store) already holds, then `right-start` when the parent menu or menubar is vertical, and `bottom-start` otherwise. Initializing the store then applies the state it shares with a linked [`store`](https://ariakit.com/reference/menu-provider#store) or [`popover`](https://ariakit.com/reference/menu-provider#popover) store, which is why either of those ends up ahead of an explicit placement. A [`combobox`](https://ariakit.com/reference/menu-provider#combobox) store no longer shares its placement or its current placement at all.

Set a placement whenever the store cannot settle the right one at that moment. A menu keeps `bottom-start`, so it stays below its item and no arrow key opens it, when the [`orientation`](https://ariakit.com/reference/menubar#orientation) of its menubar or the [`orientation`](https://ariakit.com/reference/menu-provider#orientation) of its parent menu becomes vertical after the menu store is created. A linked [`store`](https://ariakit.com/reference/menu-provider#store) or [`popover`](https://ariakit.com/reference/menu-provider#popover) store created outside a vertical parent menu or menubar likewise keeps its own placement. A menu with a vertical parent menu followed both in earlier versions.
