---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Multi-selectable Combobox with inline autocomplete

When rendering a [Multi-selectable Combobox](https://ariakit.org/examples/combobox-multiple) with the [`autoComplete`](https://ariakit.org/reference/combobox#autocomplete) prop set to `"inline"` or `"both"`, the completion string will no longer be inserted into the input upon deselecting an item. This is because the completion string generally represents an addition action, whereas deselecting an item is a removal action.
