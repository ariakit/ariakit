---
"@ariakit/test": patch
---

Fixed `contains` reporting `false` for descendants of a `<form>` or `<select>` element when tests run on happy-dom, which made elements nested in a form look like they were outside an open modal dialog.
