<!-- Description -->

It serves the same function as HTML's `<hr>`, to separate content.
Use prop `vertical` or `horizontal` to toggle Divider's orientation.
It defaults to a 1px wide horizontal line.

<!-- Minimal JSX to showcase component -->

```jsx
<Divider />
```

Rendered HTML.

```html
<div class="Divider-fJSFqG drxWOs Base-gxTqDr bCPnxv"></div>
```

Horizontal.

```jsx
<Divider horizontal borderWidth="3px" />
```

<!-- Cool styling example -->

Basic styling via props, with `vertical`.

```jsx
const { Flex, Block } = require("reas");

<Flex
  backgroundColor="rgb(85.9%, 54.3%, 30.3%)"
  color="white"
  padding={8}
  justifyContent="center"
>
  <Block>Apples</Block>
  <Divider vertical borderWidth="2px" />
  <Block>Oranges</Block>
  <Divider vertical borderWidth="2px" />
  <Block>Grapes</Block>
  <Divider vertical borderWidth="2px" />
  <Block>Strawberries</Block>
</Flex>;
```
