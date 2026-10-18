---
"@ariakit/components": patch
---

Form store pending states with overlapping calls

The `validating` and `submitting` states of form stores now stay `true` until every overlapping [`validate`](https://ariakit.com/reference/use-form-store#validate) or [`submit`](https://ariakit.com/reference/use-form-store#submit) call finishes. This also applies after [`reset`](https://ariakit.com/reference/use-form-store#reset) and across stores composed through the `store` option. Before, the first call to finish set the state to `false`.

Callbacks passed to [`onValidate`](https://ariakit.com/reference/use-form-store#onvalidate) and [`onSubmit`](https://ariakit.com/reference/use-form-store#onsubmit) must settle. If a callback cancels a previous call, resolve the previous promise instead of leaving it pending. Otherwise, the form stays in a pending state.
