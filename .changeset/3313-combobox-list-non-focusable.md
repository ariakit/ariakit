---
"@ariakit/react-core": minor
"@ariakit/react": minor
---

`ComboboxList` is no longer focusable

**BREAKING**, but unlikely to affect most users.

The [`ComboboxList`](https://ariakit.org/reference/combobox-list) component is no longer focusable and doesn't accept [`Focusable`](https://ariakit.org/reference/focusable) props such as [`autoFocus`](https://ariakit.org/reference/focusable#autofocus), [`disabled`](https://ariakit.org/reference/focusable#disabled), and [`onFocusVisible`](https://ariakit.org/reference/focusable#onfocusvisible) anymore. If you need [Focusable](https://ariakit.org/components/focusable) features specifically on the [`ComboboxList`](https://ariakit.org/reference/combobox-list) component, you can use [composition](https://ariakit.org/guide/composition) to render it as a [`Focusable`](https://ariakit.org/reference/focusable) component.

Before:

```jsx
<ComboboxList disabled />
```

After:

```jsx
<ComboboxList render={<Focusable disabled />} />
```
