---
"@ariakit/react-store": patch
---

Fixed `useStoreStateObject` keeping fields that the current selection object no longer includes and omitting newly selected fields whose value is `undefined`.
