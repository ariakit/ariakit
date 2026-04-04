---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Improved Safari focus behavior for buttons, checkboxes, and radio buttons

On Safari, buttons, checkboxes, and radio buttons don't receive focus on mousedown like other browsers. Previously, this was handled by manually focusing the element in a `mousedown` handler. Now, an explicit `tabIndex` attribute is set on these elements in Safari, which causes the browser to focus them natively. This results in more predictable focus behavior and fewer timing-sensitive workarounds.
