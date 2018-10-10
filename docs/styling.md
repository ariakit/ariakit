There are 3 ways to style your components using Reakit.

## Styled

The most common way to style your components is using the `styled` method. It uses [styled-components](https://www.styled-components.com) internally, so refer to their docs to learn more.

```jsx
import { styled, Box } from "reakit";

const Component = styled(Box)`
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 0.25em;
`;

<Component>Component</Component>
```

## Inline styles

You can pass style props to Reakit components. Those will be converted into `style={{ ... }}` and applied as inline styles. Check the `HTML` tab below to see the output.

```jsx
import { Box } from "reakit";

<Box
  backgroundColor="palevioletred"
  color="white"
  padding={8}
>
  Component
</Box>
```

## Theming

Finally, you can pass a `theme` object to `Provider` and style Reakit elements directly:

```jsx
import { Provider, Button } from "reakit";

const theme = {
  Button: `
    color: red;
  `
};

<Provider theme={theme}>
  <Button>Button</Button>
</Provider>
```