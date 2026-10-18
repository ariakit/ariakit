---
"@ariakit/react-store": patch
---

Fixed `useStoreStateObject` changing results that it had already returned, so consumers can compare a previous result with the current one to detect changed fields.
