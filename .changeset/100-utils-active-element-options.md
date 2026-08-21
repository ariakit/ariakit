---
"@ariakit/utils": minor
---

`getActiveElement` takes an options object

**BREAKING** if you're passing a second argument to `getActiveElement`.

The second parameter is now an options object. Alongside `activeDescendant`, it accepts `frame`, which controls whether focus that lives inside a frame is resolved into that frame's document. It defaults to `true`, which is the previous behavior.

Before:

```ts
getActiveElement(element, true);
```

After:

```ts
getActiveElement(element, { activeDescendant: true });
```

Pass `frame: false` to stop the lookup at the given node's own document, which is what a caller needs when it decides ownership there, where focus inside a frame is represented by the frame element:

```ts
getActiveElement(element, { frame: false });
```
