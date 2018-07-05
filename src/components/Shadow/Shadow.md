Shadow, just as the name says, adds shadow to its parent component. The parent must have `position` set to something other than `static`, such as `relative`. Shadow is built from Fit and by default renders as a `<div>`.

```jsx
<Inline relative>
  <Shadow />
  This text has a Shadow child
</Inline>
```

The `depth` prop customizes the shadow depth.

```jsx
<Inline relative>
  <Shadow depth={9} />
  This text has a deeper Shadow child
</Inline>
```
