---
"@ariakit/utils": patch
---

Fixed `fireClickEvent` to pass a valid event view in DOM environments where `document.defaultView` is not a genuine `Window`. Thanks to [@cloud-walker](https://github.com/cloud-walker).
