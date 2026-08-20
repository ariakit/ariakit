---
"@ariakit/test": patch
---

`click`, `auxclick`, and `contextmenu` are dispatched as `PointerEvent`

Pointer Events defines these three events as `PointerEvent`, and Chromium, Firefox, and WebKit all dispatch them that way, but the test environment built them as `MouseEvent`. A listener could not check `event instanceof PointerEvent`, and pointer properties such as `pointerType` were missing even though the `pointerdown` and `pointerup` of the same gesture reported them. TypeScript types all three events as `PointerEvent`, so reading `pointerType` in a listener type-checked and then returned `undefined`.

`click`, `tap`, `rightClick`, and `select` now carry the `pointerId` and `pointerType` they simulate through to the event that ends the gesture, including the click a label forwards to its control. The attributes describing the contact itself, such as `pressure` and `tiltX`, stay at their default values there, the way browsers reset them, so a pen press reporting `tiltX: 30` still ends in a `click` reporting `tiltX: 0`.

```ts
q.link("Ariakit").addEventListener("auxclick", (event) => {
  event.pointerType; // "pen"
});

await click(q.link("Ariakit"), { button: 1, pointerType: "pen" });
```

`press.Enter` and `press.Space` fire the same `PointerEvent`, but report no pointer behind it, with `pointerId: -1` and an empty `pointerType`. That is what every engine reports for a click no pointer caused.

`button` and `buttons` keep their mouse-event semantics on these three events, as Pointer Events requires, so assertions on them are unaffected.
