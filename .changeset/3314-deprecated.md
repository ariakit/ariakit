---
"@ariakit/react-core": minor
"@ariakit/react": minor
---

Removed deprecated features

**BREAKING** if you haven't addressed the deprecation warnings from previous releases.

This version eliminates features that were deprecated in previous releases: the `backdropProps` and `as` props, as well as the ability to use a render function for the `children` prop across all components.

Before:

```jsx
<Dialog backdropProps={{ className: "backdrop" }} />
<Combobox as="textarea" />
<Combobox>
  {(props) => <textarea {...props} />}
</Combobox>
```

After:

```jsx
<Dialog backdrop={<div className="backdrop" />} />
<Combobox render={<textarea />} />
<Combobox render={(props) => <textarea {...props} />} />
```

You can learn more about these new features in the [Composition guide](https://ariakit.org/guide/composition).
