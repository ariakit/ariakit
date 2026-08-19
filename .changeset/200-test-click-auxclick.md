---
"@ariakit/test": patch
---

`click` supports non-primary mouse buttons

Passing `button` to `click` now simulates that mouse button through the whole interaction. Activation behavior runs on `click`, so a non-primary button fires `auxclick` instead and never activates labels or `option` elements, and the secondary button also fires `contextmenu` while it is held down.

```ts
await click(q.link("Ariakit"), { button: 1 });
```

Chromium and WebKit keep firing `auxclick` on disabled controls, so `click` does too, even though it still suppresses `click` there. Firefox is the exception and fires neither.

`mouseDown` and `mouseUp` accept `button` the same way. Every helper that presses a button, which means `click`, `tap`, `mouseDown`, and `select`, now reports the button being held down in the `buttons` property on `pointerdown` and `mousedown` instead of always reporting `0`. Pass `buttons` to `mouseDown` and `mouseUp` yourself to describe a chorded gesture, such as pressing the secondary button while the primary one is still held, then releasing it with the primary one still down. `rightClick` keeps firing the same sequence.
