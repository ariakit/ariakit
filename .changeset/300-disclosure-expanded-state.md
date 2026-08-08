---
"@ariakit/react": patch
"@ariakit/react-components": patch
---

A trigger announces its popup as expanded while the popup is open

[`Disclosure`](https://ariakit.com/reference/disclosure) and the components built on it, [`DialogDisclosure`](https://ariakit.com/reference/dialog-disclosure), [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure), [`HovercardDisclosure`](https://ariakit.com/reference/hovercard-disclosure), [`MenuButton`](https://ariakit.com/reference/menu-button), and the deprecated [`Select`](https://ariakit.com/reference/select), now set `aria-expanded` from the open state of the content they control.

Previously, a trigger kept reporting `aria-expanded="false"` while its popup was visible whenever the open did not pass through the trigger and another element owned focus at that moment. An app-wide shortcut, an effect, a timer, or an async result calling `show()` all reach this. Several triggers sharing one store were affected too, since only whichever one the popup happened to record announced the content.

In a [`Menubar`](https://ariakit.com/reference/menubar) the attribute is also read back to decide whether hovering a sibling trigger opens its menu, so that works after such an open as well.
