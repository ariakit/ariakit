---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`PopoverAnchor` takes precedence over `PopoverDisclosure`

Fixed [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure) so it no longer overrides a separate [`PopoverAnchor`](https://ariakit.com/reference/popover-anchor) as the popover positioning anchor.

Thanks to [@bengry](https://github.com/bengry) for reporting the issue and providing the reproduction and workaround.
