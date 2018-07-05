This is the abstract layout component that all other ReaKit components are built on top of. By default it renders a `div` tag with basic reset styles.

```jsx
<Base>Base</Base>
```

Any additional css rules can be added as props:

```jsx
<Base backgroundColor="palevioletred" color="white">Base</Base>
```

It also offers convenience props to control the `position` css property:

```jsx
<Base relative width={100} height={40}>
  <Base
    absolute
    backgroundColor="palevioletred"
    left={0}
    bottom={0}
    width={10}
    height={10}
  />
</Base>
```
