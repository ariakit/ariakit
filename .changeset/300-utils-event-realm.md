---
"@ariakit/utils": patch
---

Fixed `fireEvent`, `fireBlurEvent`, `fireFocusEvent`, and `fireKeyboardEvent` building their events with the ambient window's constructors rather than those of the window that owns the element, so an event dispatched into a same-origin iframe belongs to that frame.
