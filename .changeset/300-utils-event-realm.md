---
"@ariakit/utils": patch
---

Synthetic events belong to the realm of the element they are dispatched at

`fireEvent`, `fireBlurEvent`, `fireFocusEvent`, and `fireKeyboardEvent` built their events with the ambient window's constructors. For an element inside a same-origin iframe, the event was built in the parent realm and dispatched into the frame, so a listener registered inside the frame received an event that failed `instanceof` against its own interfaces.

Each of them now takes its constructor from the window that owns the element. `fireClickEvent` already resolved that window directly and now shares the same resolution, so it keeps working when a form or a document answers the lookup with an element of its own.
