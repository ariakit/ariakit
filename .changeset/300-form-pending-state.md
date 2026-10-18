---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Form pending states with overlapping callbacks

The `validating` and `submitting` states of [`useFormStore`](https://ariakit.com/reference/use-form-store) now stay `true` until every overlapping validation or submission finishes. Before, the first one to finish set the state to `false`. For example, a blur autosave that runs after a manual submission no longer enables [`FormSubmit`](https://ariakit.com/reference/form-submit) and [`FormReset`](https://ariakit.com/reference/form-reset) while the autosave is still pending.

Callbacks passed to [`useFormValidate`](https://ariakit.com/reference/use-form-validate) and [`useFormSubmit`](https://ariakit.com/reference/use-form-submit) must settle. If a debounced callback cancels a previous call, resolve the previous promise instead of leaving it pending. Otherwise, the form stays in a pending state.
