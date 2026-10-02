---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Focusable`](https://ariakit.com/reference/focusable) inside a shadow root not setting the `data-focus-visible` attribute or calling [`onFocusVisible`](https://ariakit.com/reference/focusable#onfocusvisible) on keyboard focus. This applies to all components built on [`Focusable`](https://ariakit.com/reference/focusable), such as [`Button`](https://ariakit.com/reference/button) and [`Combobox`](https://ariakit.com/reference/combobox).
