---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed composite focus and scrolling while a popover is opening. Focus now waits for the owned popover to finish positioning, pending focus is canceled when ownership changes, and active items scroll only their intended popup scrollport without moving the page or unrelated ancestors.

Selected items in [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) and [`Select`](https://ariakit.com/reference/select) popovers are now centered when the popover opens without stealing focus. Later composite navigation continues to use nearest-edge scrolling.
