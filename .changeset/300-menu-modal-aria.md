---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Modal `Menu` keeps its accessible name and owns only its own items

Modal [`Menu`](https://ariakit.com/reference/menu) no longer loses the accessible name provided by its [`MenuButton`](https://ariakit.com/reference/menu-button), and no longer exposes a `button` among the owned elements of the element with `role="menu"`.

The menu button is part of the modal context now, so it closes the menu, and a modal menu that has one no longer renders the fallback dismiss button. If yours doesn't close the menu, because [`toggleOnClick`](https://ariakit.com/reference/menu-button#toggleonclick) is `false` or because it only shows the menu, render your own dismiss control as a menu item so that assistive technology can still leave the menu:

```tsx
<Ariakit.MenuItem render={<Ariakit.MenuDismiss />}>Close</Ariakit.MenuItem>
```

Thanks to [@afercia](https://github.com/afercia) for reporting the issue and diagnosing the cause, [@ciampo](https://github.com/ciampo) for establishing that the fix had to keep working with modal menus, [@mxp-qk](https://github.com/mxp-qk) for reporting it independently with a reproduction and the same diagnosis, [@snowystinger](https://github.com/snowystinger) and [@nataliadiak](https://github.com/nataliadiak) for investigating the browser behavior, [@ashleyryan](https://github.com/ashleyryan) for reporting it again, [@LFDanLu](https://github.com/LFDanLu) for filing the Chromium bug and proposing this approach, and [@dilipom13](https://github.com/dilipom13) for an independent implementation attempt downstream.
