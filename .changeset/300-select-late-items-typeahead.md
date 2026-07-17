---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
"@ariakit/store": patch
---

Fixed collection store [`item`](https://ariakit.com/reference/use-collection-store#item) lookups to resolve controlled items added after store creation when no live item is registered. This allows [`Select`](https://ariakit.com/reference/select) typeahead to update its value while options are unmounted. Thanks to [@georgekaran](https://github.com/georgekaran).
