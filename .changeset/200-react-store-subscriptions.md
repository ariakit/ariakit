---
"@ariakit/react-store": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Improved React store subscription performance

Store hooks now avoid registering change listeners when no setter callback is provided. [`DisclosureContent`](https://ariakit.com/reference/disclosure-content) also reads related state through a single keyed subscription, improving navigation performance in widgets powered by [`Composite`](https://ariakit.com/reference/composite), including [`Tab`](https://ariakit.com/reference/tab) components.
