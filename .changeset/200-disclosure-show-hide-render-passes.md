---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fewer render passes when showing and hiding disclosure content

[`DisclosureContent`](https://ariakit.com/reference/disclosure-content) and components based on it, such as [`Dialog`](https://ariakit.com/reference/dialog), [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`SelectPopover`](https://ariakit.com/reference/select-popover), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), [`Tooltip`](https://ariakit.com/reference/tooltip), and [`TabPanel`](https://ariakit.com/reference/tab-panel), now render fewer times when showing and hiding. Dialogs that stay mounted while closed skip one render pass on every hide and, after the first open, on every subsequent show. Content that stays mounted while hidden, has no CSS animations, and doesn't set the [`animated`](https://ariakit.com/reference/use-disclosure-store#animated) store option also skips the additional render passes that used to update the enter state, starting from the second show and hide. In the tooltip performance suite, which presses <kbd>ArrowRight</kbd> 121 times across three toolbar items, the combined changes in this release cut rendering work by 30% with a shared tooltip.

Thanks to [@aledecicco](https://github.com/aledecicco) for reporting the issue.
