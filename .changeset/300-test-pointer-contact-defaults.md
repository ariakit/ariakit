---
"@ariakit/test": patch
---

Pointer events report the contact, pressure, and pointer a real device reports

A listener on the pointer events that `hover`, `mouseDown`, `mouseUp`, and the `click`, `tap`, `rightClick`, and `select` gestures fire read `width: 0`, `height: 0`, `isPrimary: false`, and whatever transducer angle the environment happened to pick, a combination no pointing device produces. Pointer Events sizes the contact of a device that reports no geometry of its own, like a mouse, as 1 by 1, requires the altitude of a transducer perpendicular to the screen from a device that reports no tilt, and treats a lone pointer as the primary pointer of its type.

Those events now report the values Chromium, Firefox, and WebKit all report for one ordinary click, including the pressure Pointer Events defines for a device with no pressure sensor: `0.5` while a button is held down and `0` otherwise. A chorded release keeps `0.5` while another button stays held, because the pointer is still in the active buttons state, which is what Firefox and WebKit report. Chromium derives that one from the button being released and reports `0`.

```ts
q.button.ensure("Resize").addEventListener("pointerdown", (event) => {
  event.width; // 1
  event.height; // 1
  event.pressure; // 0.5
  event.isPrimary; // true
  event.altitudeAngle; // Math.PI / 2
});

await mouseDown(q.button("Resize"));
```

Values passed to a helper still win. `dispatch` sizes and angles a pointer event it builds by name the same way, because those describe a pointer at rest, and leaves the pressure and the primary pointer to the helper that knows which gesture fires the event.
