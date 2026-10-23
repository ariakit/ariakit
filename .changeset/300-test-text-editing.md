---
"@ariakit/test": patch
---

Text editing in test helpers

Test helpers now match browser behavior in these cases:

- Typing continues in an email input when a keydown handler moves focus to it.
- Typing into an email input rendered by React 19 keeps every character. Previously, only the first character remained.
- Reversing a Shift+Arrow selection adjusts the selected text before replacement.
- Backspace and Delete do not fire an input event when there is no text to delete. This prevents input handlers from moving focus after a no-op edit.
- Typing an emoji places the caret after the whole emoji. Text typed after it no longer splits the emoji into broken characters.

Thanks to [@asbjorn-brevio](https://github.com/asbjorn-brevio) for reporting the email combobox issue, and [@renatorib](https://github.com/renatorib) for investigating it.
