> ReaKit uses [styled-components](https://www.styled-components.com) to style components.

This is an example of how a component is defined in the library:
```jsx
import { styled, Base } from "reakit";

const Box = styled(Base)`
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 0.25em;
`;

<Box>Box</Box>
```

You can easily extend `Base` and apply new styles:
```jsx
import { styled, Base } from "reakit";

const MyBox = styled(Base)`
  background-color: palevioletred;
  padding: 8px;
`;

<MyBox>MyBox</MyBox>
```

Another way to style your enhanced components is by passing style props. Those styles will be converted into `style={{ ... }}` and applied as inline styles. Check the `HTML` tab to see the output.

```jsx
import { Base } from "reakit";

<Base
  backgroundColor="palevioletred"
  color="white"
  padding={8}
>
  Box
</Base>
```

Finally, you can pass a `theme` object to `Provider` and style ReaKit elements directly:

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