---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed the [Focusable](https://ariakit.org/components/focusable) and its derived components that were incorrectly calling the [`onFocusVisible`](https://ariakit.org/reference/focusable#onfocusvisible) callback prop when the element had lost focus.

This didn't align with the behavior of the [`data-focus-visible`](https://ariakit.org/guide/styling#data-focus-visible) attribute. The behavior now mirrors the attribute, which will only be omitted from the element if `event.preventDefault()` is invoked from within the [`onFocusVisible`](https://ariakit.org/reference/focusable#onfocusvisible) callback.
