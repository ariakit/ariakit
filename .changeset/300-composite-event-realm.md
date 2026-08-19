---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Events synthesized inside a same-origin iframe belong to that frame

[`Composite`](https://ariakit.com/reference/composite) synthesizes two events on its virtual-focus path, forwarding the keyboard event to the active item and blurring the previous one, and [`Menu`](https://ariakit.com/reference/menu) synthesizes a third when a submenu closes after the pointer leaves it. All three were built with the outer window's constructors, so for an item inside a same-origin iframe a listener registered inside that frame received an event that failed `instanceof` against its own interfaces.

```ts
frameWindow.document.addEventListener("keydown", (event) => {
  // For an item inside that frame: was false, now true.
  event instanceof frameWindow.KeyboardEvent;
});
```

Code in the outer document sees the mirror of this. An item is placed inside a frame by portalling it there, so a handler passed as a prop is authored in the outer realm, and testing one of these events with that realm's own `instanceof` used to succeed and now does not. Such a handler should compare against the constructors of the window that owns the element it is attached to, which is what the browser gives a real event dispatched in a frame.

This reaches every component built on [`Composite`](https://ariakit.com/reference/composite): [`Combobox`](https://ariakit.com/reference/combobox), [`ComboboxSelect`](https://ariakit.com/reference/combobox-select), [`Menu`](https://ariakit.com/reference/menu), [`MenuList`](https://ariakit.com/reference/menu-list), [`Menubar`](https://ariakit.com/reference/menubar), [`RadioGroup`](https://ariakit.com/reference/radio-group), [`SelectList`](https://ariakit.com/reference/select-list), [`SelectPopover`](https://ariakit.com/reference/select-popover), [`TabList`](https://ariakit.com/reference/tab-list), and [`Toolbar`](https://ariakit.com/reference/toolbar).
