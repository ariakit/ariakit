---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed arrow keys moving focus out of a text field rendered as [`CompositeItem`](https://ariakit.com/reference/composite-item) before the caret reached the start or end of the text when a two-dimensional composite sets [`orientation`](https://ariakit.com/reference/composite-provider#orientation) to `vertical` or `horizontal`. This also applies to all components built on [`CompositeItem`](https://ariakit.com/reference/composite-item).
