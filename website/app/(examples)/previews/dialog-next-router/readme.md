# Dialog with Next.js App Router

<p data-description>
  Using <a href="https://nextjs.org/docs/app/building-your-application/routing/parallel-routes">Next.js Parallel Routes</a> to create an accessible modal <a href="/components/dialog">Dialog</a> that is rendered on the server and controlled by the URL, with built-in focus management.
</p>

<a href="./page.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)

</div>

## Related examples

<div data-cards="examples">

- [](/examples/tab-next-router/)
- [](/examples/dialog-react-router/)
- [](/examples/dialog-menu/)
- [](/examples/dialog-nested/)

</div>

## Controlling the Dialog state

To control the open state, you can pass the [`open`](/apis/dialog-store#open) and [`setOpen`](/apis/dialog-store#setopen) props to [`useDialogStore`](/apis/dialog-store). These props allow you to synchronize the dialog state with other state sources, such as the browser history.

In this example, since the dialog is only rendered when the route matches, we can pass `open: true` to the store so that the dialog is always open. Then, we can use `setOpen` to navigate back when the dialog is closed:

```js
const router = useRouter();

const dialog = Ariakit.useDialogStore({
  open: true,
  setOpen(open) {
    if (!open) {
      router.push("/previews/dialog-next-router");
    }
  },
});
```

You can learn more about controlled state on the [Component stores](/guide/component-stores#controlled-state) guide.

## Restoring focus on hide

When the dialog is closed, the focus is automatically returned to the element that was previously focused before opening the dialog. Typically, this is the element that triggered the dialog. However, in cases where a user navigates to the modal URL directly, there is no element to focus on hide.

To handle this scenario, the [`autoFocusOnHide`](/apis/dialog#autofocusonhide) prop can be used to specify a fallback element to focus on hide:

```jsx
const pathname = usePathname();

<Dialog
  autoFocusOnHide={(element) => {
    if (!element) {
      document.querySelector(`[href="${pathname}"]`)?.focus();
    }
    return true;
  }}
>
```
