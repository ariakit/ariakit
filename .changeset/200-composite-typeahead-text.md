---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

New `typeaheadText` prop on `CompositeItem`

The [`CompositeItem`](https://ariakit.com/reference/composite-item) component now accepts a [`typeaheadText`](https://ariakit.com/reference/composite-item#typeaheadtext) prop that defines a custom text to be matched during typeahead. This is useful when the item's content differs from the text that should be matched, such as when the content includes an emoji.

```tsx
<Ariakit.SelectItem value="Apple" typeaheadText="Apple">
  🍎 Apple
</Ariakit.SelectItem>
```
