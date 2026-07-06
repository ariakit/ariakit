---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Added `useFormValue`, `useFormValidate`, and `useFormSubmit`

The new [`useFormValue`](https://ariakit.com/reference/use-form-value), [`useFormValidate`](https://ariakit.com/reference/use-form-validate), and [`useFormSubmit`](https://ariakit.com/reference/use-form-submit) hooks replace the matching [`useFormStore`](https://ariakit.com/reference/use-form-store) methods with top-level hook calls that are compatible with the React Compiler:

```tsx
const value = useFormValue(form, form.names.email);

useFormSubmit(form, async (state) => {
  // ...
});
```
