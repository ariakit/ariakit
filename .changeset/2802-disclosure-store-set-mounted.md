---
"@ariakit/core": patch
"@ariakit/react-core": patch
"@ariakit/react": patch

---

Added `setMounted` prop to `useDisclosureStore` and derived component stores. This callback prop can be used to react to changes in the `mounted` state. For example:

```js
useDialogStore({
  setMounted(mounted) {
    if (!mounted) {
      props.onUnmount?.();
    }
  },
});
```
