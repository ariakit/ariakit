---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`CompositeItem`](https://ariakit.com/reference/composite-item) to register on the enclosing [`Composite`](https://ariakit.com/reference/composite) store — and thus stay reachable with the arrow keys — when rendered as the same element as a component that sets its own composite context, such as a [`MenuButton`](https://ariakit.com/reference/menu-button) inside a [`MenuProvider`](https://ariakit.com/reference/menu-provider).
