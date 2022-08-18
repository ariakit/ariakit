---
"ariakit": patch
---

Fixed `onFocusVisible` timing on the `Focusable` component so it waits for any logic in focus/keydown events to be performed before applying the `data-focus-visible` attribute. ([#1774](https://github.com/ariakit/ariakit/pull/1774))
