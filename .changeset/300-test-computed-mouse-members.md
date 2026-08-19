---
"@ariakit/test": patch
---

Fixed named mouse and pointer events in `@ariakit/test` to derive `pageX` and `pageY` from the client coordinates and target window scroll, and derive `which` from `button`, matching browser-generated events even when the environment provides no `MouseEvent` base.
