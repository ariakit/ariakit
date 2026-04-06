---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed a race condition in [`Dialog`](https://ariakit.org/reference/dialog) where the deferred auto-focus could steal focus from the disclosure element after the dialog was closed.
