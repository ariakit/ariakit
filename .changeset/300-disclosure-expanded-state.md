---
"@ariakit/react": patch
"@ariakit/react-components": patch
---

Fixed [`Disclosure`](https://ariakit.com/reference/disclosure) and components built on it, such as [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure) and [`MenuButton`](https://ariakit.com/reference/menu-button), reporting `aria-expanded="false"` while the content they control was open.
