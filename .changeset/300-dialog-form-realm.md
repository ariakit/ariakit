---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Dialogs rendered as a form open again when a control shadows a built-in name

A `<form>` exposes its controls as named properties that override built-ins, so a control named `self`, `document`, or `ownerDocument` answers when [`Dialog`](https://ariakit.com/reference/dialog) resolves the document and window that own it. The dialog threw instead of opening, and on Safari it threw while still closed, so the page failed before anyone interacted with it.

```tsx
<Ariakit.Dialog render={<form />}>
  <input type="checkbox" name="self" />
</Ariakit.Dialog>
```

Names like these are ordinary on a real form, such as a checkbox recording that a benefit covers the person filling it in.
