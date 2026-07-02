---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Radio `onChange` event on arrow-key selection

Selecting a native [`Radio`](https://ariakit.com/reference/radio) or [`FormRadio`](https://ariakit.com/reference/form-radio) with arrow keys now delivers a real `change` event with `event.target.checked` already set to `true`, matching pointer and Space selection. Previously, the handler received the focus event while `checked` was still `false`, which silently broke handlers gated on `event.target.checked`.

Since arrow-key selection now replays the browser's native activation, `onClick` handlers also fire when a native radio is selected with arrow keys, matching native radio group behavior.
