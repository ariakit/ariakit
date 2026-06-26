---
"@ariakit/utils": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed text field detection for elements rendered inside same-origin iframes. This fixes [`Composite`](https://ariakit.com/reference/composite) keyboard navigation for iframe text fields, including components built on it such as [`Toolbar`](https://ariakit.com/reference/toolbar), and prevents [`Command`](https://ariakit.com/reference/command) and [`Combobox`](https://ariakit.com/reference/combobox) from treating iframe text fields as non-text fields.
