---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed focus and scroll moving into a popup before a custom [`updatePosition`](https://ariakit.com/reference/popover#updateposition) that calls the supplied default function has finished its own work, which affects [`Popover`](https://ariakit.com/reference/popover) and components built on it such as [`Menu`](https://ariakit.com/reference/menu) and [`Select`](https://ariakit.com/reference/select).
