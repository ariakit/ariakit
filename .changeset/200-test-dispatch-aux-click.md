---
"@ariakit/test": patch
---

Added `dispatch.auxClick`

`dispatch` now fires `auxclick` by name, like every other event it builds. `@testing-library/dom` has no `auxclick` entry in its event map, so firing that event previously meant building it by hand and passing it to `dispatch(element, event)`.

```ts
await dispatch.auxClick(q.link("Ariakit"), { button: 1 });
```
