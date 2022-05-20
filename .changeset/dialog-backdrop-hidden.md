---
"ariakit": minor
---

The `hidden` prop passed to `Dialog` is now inherited by the internal `DialogBackdrop` component. ([#1387](https://github.com/ariakit/ariakit/pull/1387))

Before, if we wanted to pass `hidden={false}` to both the dialog and the backdrop components, we would have to do this (still works):

```jsx
<Dialog hidden={false} backdropProps={{ hidden: false }} />
```

Now, the `backdropProps` is not necessary anymore:

```jsx
<Dialog hidden={false} />
```
