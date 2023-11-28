---
tags:
  - Dialog
  - Routing
  - Next.js
  - Next.js App Router
---

# Dialog with Next.js App Router

<div data-description>

Using [Next.js Parallel Routes](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes) to create an accessible modal [Dialog](/components/dialog) that is rendered on the server and controlled by the URL, with built-in focus management.

</div>

<div data-tags></div>

<a href="./page.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)

</div>

## Controlling the Dialog state

To control the open state, you can pass the [`open`](/reference/dialog#open) and [`onClose`](/reference/dialog#onclose) props to the [`Dialog`](/reference/dialog) component. These props allow you to synchronize the dialog state with other state sources, such as the browser history.

In this example, since the dialog is only rendered when the route matches, we can pass `open={true}` to the [`Dialog`](/reference/dialog) component so that the dialog is always open. Then, we can use [`onClose`](/reference/dialog#onclose) to navigate back when the dialog is closed:

```jsx
const router = useRouter();

<Dialog open onClose={() => router.push("/previews/dialog-next-router")}>
```

## Restoring focus on hide

When the dialog is closed, the focus is automatically returned to the element that was previously focused before opening the dialog. Typically, this is the element that triggered the dialog. However, in cases where a user navigates to the modal URL directly, there is no element to focus on hide.

To handle this scenario, the [`autoFocusOnHide`](/reference/dialog#autofocusonhide) prop can be used to specify a fallback element to focus on hide:

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

## Related examples

<div data-cards="examples">

- [](/examples/tab-next-router)
- [](/examples/dialog-react-router)
- [](/examples/dialog-menu)
- [](/examples/dialog-nested)
- [](/examples/dialog-hide-warning)
- [](/examples/menubar-navigation)

</div>
