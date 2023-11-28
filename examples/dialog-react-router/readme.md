---
tags:
  - Dialog
  - Button
  - Focusable
  - VisuallyHidden
  - Routing
  - React Router
---

# Dialog with React Router

<div data-description>

Using [React Router](https://reactrouter.com) to create a modal [Dialog](/components/dialog) that's controlled by the browser history.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)
- [](/components/button)
- [](/components/focusable)
- [](/components/visually-hidden)

</div>

## Controlling the Dialog state

To control the open state, you can pass the [`open`](/reference/dialog#open) and [`onClose`](/reference/dialog#onclose) props to the [`Dialog`](/reference/dialog) component. These props allow you to synchronize the dialog state with other state sources, such as the browser history.

In this example, since the dialog is only rendered when the route matches, we can pass `open={true}` to the [`Dialog`](/reference/dialog) so that the dialog is always open. Then, we can use [`onClose`](/reference/dialog#onclose) to navigate back when the dialog is closed:

```jsx
const navigate = useNavigate();

<Dialog open onClose={() => navigate("/")}>
```

## Related examples

<div data-cards="examples">

- [](/examples/tab-react-router)
- [](/examples/dialog-next-router)
- [](/examples/dialog-menu)
- [](/examples/dialog-nested)
- [](/examples/dialog-hide-warning)
- [](/examples/menubar-navigation)

</div>
