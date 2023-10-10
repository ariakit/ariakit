---
tags:
  - Dialog
  - Button
---

# Dialog with React-Toastify

<div data-description>

Showing notification toasts using libraries like [react-toastify](https://fkhadra.github.io/react-toastify/introduction) and [react-hot-toast](https://react-hot-toast.com/) while keeping a modal [Dialog](/components/dialog) open with the [`getPersistentElements`](/reference/dialog#getpersistentelements) prop.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/dialog)
- [](/components/button)

</div>

## Keeping toasts accessible

Using the [`getPersistentElements`](/reference/dialog#getpersistentelements) prop, you can keep the modal dialog and the notification toasts accessible at the same time. Users will be able to navigate between the dialog and the persistent elements using the <kbd>Tab</kbd> key and interact with the toasts without closing the modal dialog.

```jsx
<Dialog getPersistentElements={() => document.querySelectorAll(".Toastify")} />
```

Note that the elements returned by this function **must be present in the DOM** when the dialog is open.

## Related examples

<div data-cards="examples">

- [](/examples/dialog-menu)
- [](/examples/dialog-nested)
- [](/examples/dialog-hide-warning)
- [](/examples/dialog-backdrop-scrollable)

</div>
