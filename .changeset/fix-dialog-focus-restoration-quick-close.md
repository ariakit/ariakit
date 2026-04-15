---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog) not restoring focus to the disclosure element when the dialog was closed quickly after opening (e.g., within the same browser task), because the internal `hasOpened` guard was set in a deferred effect that hadn't run yet.
