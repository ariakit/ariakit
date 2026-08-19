---
"@ariakit/test": patch
---

Fixed `dispatch` to expose only event names it can build, preventing the unsupported `doubleClick` alias from being typed or installed at runtime.
