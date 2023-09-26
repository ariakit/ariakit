---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

The [`hideOnEscape`](https://ariakit.org/reference/dialog#hideonescape) prop is now triggered during the capture phase.

Essentially, this means that you can now prevent the propagation of the <kbd>Escape</kbd> keydown event to other elements in the DOM when it's used to close an Ariakit [Dialog](https://ariakit.org/components/dialog):

```jsx
<Dialog
  hideOnEscape={(event) => {
    event.stopPropagation();
    return true;
  }}
/>
```
