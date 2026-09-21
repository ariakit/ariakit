---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Composite`](https://ariakit.com/reference/composite) replaying an earlier focus move when its provider remounts with an external store. This applies to components built on it, including [`Menu`](https://ariakit.com/reference/menu), which could scroll the page when a submenu reopened. Thanks to [@blowery](https://github.com/blowery).
