---
"@ariakit/test": minor
---

Test queries ensure matches by default

**BREAKING** if you use `q` or `query` methods that may not find an element, or if you use their `.ensure` variants.

Single-element queries now throw when no matching element is found. The `.ensure` variant has been removed, and the new `.maybe` variant returns `null` when no element is found. Collection queries such as `.all()` continue to return an empty array when there are no matches.

Before:

```ts
const saveButton = q.button.ensure("Save");
const optionalDialog = q.dialog("Settings");
```

After:

```ts
const saveButton = q.button("Save");
const optionalDialog = q.dialog.maybe("Settings");
```
