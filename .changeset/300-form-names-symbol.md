---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`form.names.*` paths no longer crash on symbol access

Fixed [`useFormStore`](https://ariakit.com/reference/use-form-store) [`names`](https://ariakit.com/reference/use-form-store#names) values throwing `Cannot convert a Symbol value to a string` when an absent symbol key was read from them. This happened whenever something probed a symbol on a raw name — most notably when React reads `Symbol.iterator` to reconcile a name rendered as a React child, but also `Object.prototype.toString.call(name)` and `Array.from(name)`.

Absent symbol keys now resolve to `undefined`, matching plain-object semantics, so those probes degrade gracefully. The documented string coercion keeps working, so coerce a name before rendering or inspecting it outside Ariakit props:

```tsx
<p>This field submits as {`${form.names.email}`}.</p>
```
