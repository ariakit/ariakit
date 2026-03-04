---
"@ariakit/react-core": patch
---

Fixed `MenuItemRadio` controlled state syncing by updating `getValue` to clear
the store value when a controlled radio item becomes unchecked and it currently
matches that item.
