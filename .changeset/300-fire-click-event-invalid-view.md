---
"@ariakit/utils": patch
---

Fixed `fireClickEvent` in DOM environments with a non-`Window` document view

`fireClickEvent` now passes `null` as the event view when `document.defaultView` exposes event constructors but is not a genuine `Window`. This prevents strict DOM implementations from rejecting the synthetic click while preserving the owner window for real browser documents and same-origin iframes.

Thanks to [@cloud-walker](https://github.com/cloud-walker) for reporting and reproducing the issue, diagnosing its cause, and exploring possible solutions.
