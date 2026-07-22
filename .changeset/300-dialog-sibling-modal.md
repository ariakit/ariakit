---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed sibling modal [`Dialog`](https://ariakit.com/reference/dialog) components and modal components built on them, such as [`Popover`](https://ariakit.com/reference/popover) and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), rendered in their default portals so opening them in the same render no longer made each other inert. Thanks to [@yishayhaz](https://github.com/yishayhaz) and [@gonzoblasco](https://github.com/gonzoblasco).
