---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Modal `Menu` includes the menu button in the modal context

The [`Menu`](https://ariakit.com/reference/menu) component with the [`modal`](https://ariakit.com/reference/menu#modal) prop now keeps its [`MenuButton`](https://ariakit.com/reference/menu-button) out of the `inert` subtree. Chromium refuses to read an `inert` element as the menu's `aria-labelledby` target, so the menu had no accessible name when the button was named by its own text content.

Since the menu button is part of the modal context now, it's also the way out of the menu. So a modal menu with a [`MenuButton`](https://ariakit.com/reference/menu-button), or with any other element assigned through [`setDisclosureElement`](https://ariakit.com/reference/use-menu-store#setdisclosureelement), no longer renders the visually hidden dismiss button inside the element with `role="menu"`, where the ARIA menu pattern doesn't allow a plain `button`. Menus opened without one, such as context menus, still get it.

If that element doesn't close the menu, because [`toggleOnClick`](https://ariakit.com/reference/menu-button#toggleonclick) is `false` or because it only shows the menu, render your own dismiss control as a menu item so that assistive technology can still leave the menu:

```tsx
<Ariakit.MenuItem render={<Ariakit.MenuDismiss />}>Close</Ariakit.MenuItem>
```

Thanks to [@afercia](https://github.com/afercia) for reporting the issue and diagnosing the cause, and [@snowystinger](https://github.com/snowystinger) for investigating the browser behavior.
