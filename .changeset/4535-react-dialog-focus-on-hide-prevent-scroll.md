---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Scrolling behavior when closing dialogs and popovers

When hiding a dialog or popover, the [`finalFocus`](https://ariakit.org/reference/dialog#finalfocus) element will no longer scroll into view. This change prevents scrolling issues when the element lies outside the viewport and mirrors the behavior of native HTML dialog and popover elements.
