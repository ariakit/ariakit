---
"@ariakit/test": patch
---

Chorded button changes fire `pointermove`

`mouseDown` and `mouseUp` now follow Pointer Events for a chorded gesture, where a button changes state while another one stays held down. No `pointerdown` or `pointerup` fires in that case, so the change rides on `pointermove` and only the compatibility `mousedown` and `mouseup` fire for each button. Describe the gesture by passing `buttons` yourself, as before.

```ts
// The primary button stays held while the secondary one is pressed, so this
// fires `pointermove` instead of `pointerdown`, and `mousedown` still fires.
await mouseDown(q.button("Resize"), { button: 2, buttons: 3 });
// The primary button is still held after the release, so this fires
// `pointermove` instead of `pointerup`, and `mouseup` still fires.
await mouseUp(q.button("Resize"), { button: 2, buttons: 1 });
```

A canceled `pointerdown` also keeps suppressing the compatibility mouse events until the gesture ends, so a chorded press and release in between fire none either. Both sequences match what Chromium, Firefox, and WebKit produce for the same gesture.
