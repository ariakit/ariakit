---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Controlled store updates are no longer flushed synchronously.

Previously, we were wrapping _all_ controlled store updates with [`ReactDOM.flushSync`](https://react.dev/reference/react-dom/flushSync). This approach proved to be quite fragile and led to a few problems. Now, we only apply this to specific updates that require synchronous flushing.

This change shouldn't impact your application, unless you're already facing problems, which could be fixed by this. If you find any issues stemming from this change, please let us know. Regardless, you can always opt into the previous behavior by wrapping your own updates in `flushSync` when needed:

```js
const [open, setOpen] = useState(false);

useDialogStore({
  open,
  setOpen(open) {
    ReactDOM.flushSync(() => setOpen(open));
  },
});
```
