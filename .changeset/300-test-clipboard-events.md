---
"@ariakit/test": patch
---

Fixed `@ariakit/test` clipboard event dispatch so caller-supplied `clipboardData` is preserved by named dispatchers and caller-built events in environments without native clipboard event support.
