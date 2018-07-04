It serves the same function as HTML's `<hr>`, to separate content. Use prop `vertical` or `horizontal` to toggle Divider's orientation. It defaults to a 1px wide horizontal line.

```jsx
<Divider />
```

Basic styling via props, with `vertical`.

```jsx
import { Flex, Block } from "reakit";

<Flex
  backgroundColor="rgb(85.9%, 54.3%, 30.3%)"
  color="white"
  padding={8}
  justifyContent="center"
>
  <Block>Apples</Block>
  <Divider vertical />
  <Block>Oranges</Block>
  <Divider vertical />
  <Block>Grapes</Block>
  <Divider vertical />
  <Block>Strawberries</Block>
</Flex>
```
