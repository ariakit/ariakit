---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

The [Dialog](https://ariakit.org/components/dialog) and related components can now receive controlled [`open`](https://ariakit.org/reference/dialog#open) and [`onClose`](https://ariakit.org/reference/dialog#onclose) props, allowing them to be used without a store:

```jsx
const [open, setOpen] = useState(false);

<Dialog
  open={open}
  onClose={() => setOpen(false)}
>
```
