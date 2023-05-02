# Dialog with React-Toastify

<p data-description>
  Showing notification toasts using libraries like <a href="https://fkhadra.github.io/react-toastify/introduction">react-toastify</a> and <a href="https://react-hot-toast.com/">react-hot-toast</a> while keeping a modal <a href="/components/dialog">Dialog</a> open with the <a href="/apis/dialog#getpersistentelements"><code>getPersistentElements</code></a> prop.
</p>

<a href="./index.tsx" data-playground>Example</a>

## Keeping toasts accessible

Using the [`getPersistentElements`](/apis/dialog#getpersistentelements) prop, you can keep the modal dialog and the notification toasts accessible at the same time. Users will be able to navigate between the dialog and the persistent elements using the <kbd>Tab</kbd> key and interact with the toasts without closing the modal dialog.

```jsx
<Dialog getPersistentElements={() => document.querySelectorAll(".Toastify")} />
```

Note that the elements returned by this function **must be present in the DOM** when the dialog is open.
