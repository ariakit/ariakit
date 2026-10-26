---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Disclosure`](https://ariakit.com/reference/disclosure) elements that share a store and receive inline ref callbacks moving `aria-expanded`, and the position of a popup anchored to them, to the first element when they re-render. This applies to all components built on [`Disclosure`](https://ariakit.com/reference/disclosure), including [`MenuButton`](https://ariakit.com/reference/menu-button) and [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure).
