---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`Dialog` keeps the disclosure element it was given

[`Dialog`](https://ariakit.com/reference/dialog) and components built on it, such as [`Popover`](https://ariakit.com/reference/popover), [`Menu`](https://ariakit.com/reference/menu), [`SelectPopover`](https://ariakit.com/reference/select-popover), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), [`Hovercard`](https://ariakit.com/reference/hovercard), and [`Tooltip`](https://ariakit.com/reference/tooltip), used to record the focused element as their opener right after opening, overwriting whatever was already there. Naming the trigger with [`setDisclosureElement`](https://ariakit.com/reference/use-disclosure-store#setdisclosureelement) before showing the content had no effect, so the trigger kept reporting `aria-expanded="false"` and the content treated the field the caret was in as its opener.

```ts
// The trigger now stays the opener, so it's the element announced as expanded.
popover.setDisclosureElement(triggerRef.current);
popover.show();
```

Recording the focused element is now a fallback for when nothing named an opener, and a mounted trigger already counts as one. Showing the content programmatically while a [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure) or a similar component is rendered keeps that component as the opener instead of the element that happened to have focus. The content derives its expanded state, where it is positioned when no [`PopoverAnchor`](https://ariakit.com/reference/popover-anchor) is set, the elements that count as outside it, and where focus returns on close, all from the opener, so all four now follow the trigger.
