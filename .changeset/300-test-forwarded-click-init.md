---
"@ariakit/test": patch
---

Fixed click-family gesture helpers to reset `isPrimary` on their terminal events, fixed `click` to carry modifiers, coordinates, and `detail` to the click a label forwards to its control, and fixed `press.Enter` to carry `modifier*` values such as `modifierCapsLock` to a form's implicit submit-button click.
