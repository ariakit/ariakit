---
"@ariakit/test": minor
---

Renamed the `includesHidden` query variant to `hidden`

**BREAKING** if you use the `includesHidden` role-query variant from `@ariakit/test`.

The role-query variant that also matches elements hidden from the accessibility tree (such as `inert` or `aria-hidden` elements) has been renamed from `includesHidden` to `hidden`.

Before:

```ts
q.dialog.includesHidden("Settings");
q.menuitemcheckbox.all.includesHidden();
```

After:

```ts
q.dialog.hidden("Settings");
q.menuitemcheckbox.all.hidden();
```
