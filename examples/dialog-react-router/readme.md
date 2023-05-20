# Dialog with React Router

<p data-description>
  Using <a href="https://reactrouter.com">React Router</a> to create a modal <a href="/components/dialog">Dialog</a> that's controlled by the browser history.
</p>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)

</div>

## Controlling the Dialog state

To control the open state, you can pass the [`open`](/apis/dialog-store#open) and [`setOpen`](/apis/dialog-store#setopen) props to [`useDialogStore`](/apis/dialog-store). These props allow you to synchronize the dialog state with other state sources, such as the browser history.

In this example, since the dialog is only rendered when the route matches, we can pass `open: true` to the store so that the dialog is always open. Then, we can use `setOpen` to navigate back when the dialog is closed:

```js {4,7}
const navigate = useNavigate();

const dialog = Ariakit.useDialogStore({
  open: true,
  setOpen(open) {
    if (!open) {
      navigate("/");
    }
  },
});
```

You can learn more about controlled state on the [Component stores](/guide/component-stores#controlled-state) guide.

## Related examples

<div data-cards="examples">

- [](/examples/tab-react-router)
- [](/examples/dialog-next-router)
- [](/examples/dialog-menu)
- [](/examples/dialog-nested)

</div>
