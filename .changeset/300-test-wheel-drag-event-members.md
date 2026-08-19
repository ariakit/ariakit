---
"@ariakit/test": patch
---

Fixed `dispatch.wheel` and the drag dispatchers such as `dispatch.dragStart` and `dispatch.drop` to apply the `MouseEventInit` and modifier init members that `WheelEvent` and `DragEvent` accept in browsers, where both derive from `MouseEvent`, so a listener reading `ctrlKey` or `clientX` no longer receives `undefined` and calling `getModifierState` no longer throws a `TypeError`.
