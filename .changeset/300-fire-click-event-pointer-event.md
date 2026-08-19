---
"@ariakit/utils": patch
---

`fireClickEvent` dispatches a `PointerEvent`

`fireClickEvent` now builds a `PointerEvent` from the window that owns the element, the way browsers dispatch a click, and reports `pointerId: -1` with an empty `pointerType` unless the caller passes a pointer. It previously built a `MouseEvent` from the ambient global, which dropped the pointer members its `PointerEventInit` parameter accepted and put the event in the wrong realm for an element inside a same-origin iframe. Where the environment has no `PointerEvent`, it still builds a `MouseEvent`, so activation keeps working and only the pointer members are dropped.

Every pointer attribute other than `pointerId` and `pointerType`, such as `pressure`, `width`, `tiltX`, `isPrimary`, and `persistentDeviceId`, is reported at its default value even when the caller passes it, which is what Pointer Events requires of a click.
