---
"ariakit": major
---

The `defaultVisible`, `visible`, and `setVisible` properties on `useDisclosureState` and derived state hooks have been renamed to `defaultOpen`, `open`, and `setOpen`, respectively. ([#1426](https://github.com/ariakit/ariakit/issues/1426), [#1521](https://github.com/ariakit/ariakit/pull/1521))

**Before**:

```js
const dialog = useDialogState({ defaultVisible, visible, setVisible });
dialog.visible;
dialog.setVisible;
```

**After**:

```js
const dialog = useDialogState({ defaultOpen, open, setOpen });
dialog.open;
dialog.setOpen;
```
