---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed `DisclosureContent` over-waiting to unmount with mixed transitions and animations

[`DisclosureContent`](https://ariakit.com/reference/disclosure-content) (and components built on top of it, such as [`Dialog`](https://ariakit.com/reference/dialog) and [`Popover`](https://ariakit.com/reference/popover)) could keep [`unmountOnHide`](https://ariakit.com/reference/disclosure-content#unmountonhide) content mounted longer than necessary when a transition and an animation were both applied and the longest delay and longest duration belonged to different properties.

The unmount timeout is now the longest per-property end time (`delay + duration`) across the transitions and animations, instead of the longest delay added to the longest duration, which could overestimate the real end time and keep `unmountOnHide` content mounted longer than necessary. A leftover `duration` or `delay` with no matching transition or animation (such as an `animation-duration` while `animation-name` is `none`) is also ignored now.
