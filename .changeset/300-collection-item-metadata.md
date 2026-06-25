---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`useCollectionStore`](https://ariakit.com/reference/use-collection-store) so `item(id)` reflects metadata from the current `items` state, including controlled `items` updates. This also fixes closed [`Select`](https://ariakit.com/reference/select) keyboard navigation so disabled items from controlled state are skipped.
