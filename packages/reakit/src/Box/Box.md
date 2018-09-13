This is the abstract layout component that all other Reakit components are built on top of. By default it renders a `div` tag with basic reset styles.

```jsx
<Box>Box</Box>
```

Any additional css rules can be added as props:

```jsx
<Box backgroundColor="palevioletred" color="white">Box</Box>
```

It also offers convenience props to control the `position` css property:

```jsx
<Box relative width={100} height={40}>
  <Box
    absolute
    backgroundColor="palevioletred"
    left={0}
    bottom={0}
    width={10}
    height={10}
  />
</Box>
```
