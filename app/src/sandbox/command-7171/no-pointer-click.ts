// Measured on Chromium 151, Firefox 153, and WebKit 26.5: a click no pointer
// caused, such as Enter or Space activation, is a `PointerEvent` built by the
// window that owns the element, reporting `pointerId: -1` and an empty
// `pointerType`.
//
// Shared by both suites so the authoritative browser test and its happy-dom
// duplicate cannot drift to different expected shapes.
export const NO_POINTER_CLICK =
  'PointerEvent, own window, pointerId -1, pointerType ""';
