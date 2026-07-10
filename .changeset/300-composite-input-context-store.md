---
"@ariakit/react-components": patch
---

`CompositeInput` reads the store from context

The deprecated `CompositeInput` component now reads the store from the closest [`Composite`](https://ariakit.com/reference/composite) or [`CompositeProvider`](https://ariakit.com/reference/composite-provider) context when the `store` prop is not provided, as its documentation already stated.

As a result, while the caret moves within the text field, `CompositeInput` now only stops the propagation of arrow keys along the composite widget's [`orientation`](https://ariakit.com/reference/use-composite-store#orientation). Arrow keys on the other axis, which the composite widget doesn't handle, are no longer stopped.
