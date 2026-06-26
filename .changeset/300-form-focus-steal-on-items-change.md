---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Form`](https://ariakit.com/reference/form) stealing focus into an invalid field when its items changed after a successful submission with [`resetOnSubmit`](https://ariakit.com/reference/form#resetonsubmit) set to `false`, so [`autoFocusOnSubmit`](https://ariakit.com/reference/form#autofocusonsubmit) again focuses the first invalid field only as a result of a failed submission.
