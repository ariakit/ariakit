---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog) throwing instead of opening when it renders a form with a control named `self`, `document`, or `ownerDocument`, and on Safari throwing before the dialog was ever opened, so the page failed without anyone interacting with it.
