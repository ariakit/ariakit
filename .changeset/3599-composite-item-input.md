---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Rendering composite items as input elements

We've added the ability to render [`CompositeItem`](https://ariakit.org/reference/composite-item) as an input element using the [`render`](https://ariakit.org/reference/composite-item#render) prop:

```jsx
<CompositeItem render={<input />} />
```

Before, you could only do this with the experimental `CompositeInput` component. Now, this functionality is integrated directly into the [`CompositeItem`](https://ariakit.org/reference/composite-item) component.
