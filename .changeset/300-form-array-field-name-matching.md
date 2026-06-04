---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`FormPush`](https://ariakit.com/reference/form-push) and [`FormRemove`](https://ariakit.com/reference/form-remove) incorrectly matching sibling array fields whose names share a prefix (for example `tags` and `tags2`) and throwing when a field name contained regular expression special characters.
