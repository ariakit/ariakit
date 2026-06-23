---
"@ariakit/test": patch
---

Fixed `press.Enter()` and `type("\n")` to emit an Enter `keypress` with `charCode` `13` when typing into text fields.
