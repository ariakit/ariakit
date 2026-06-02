---
"@ariakit/store": patch
"@ariakit/solid-store": patch
---

Fixed [`createStore`](https://ariakit.com/reference/create-store) to avoid notifying [`subscribe`](https://ariakit.com/reference/subscribe) and [`sync`](https://ariakit.com/reference/sync) listeners twice when an initialized child store updates shared parent state.
