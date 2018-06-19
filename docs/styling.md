ReaKit components are styled using [styled-components](https://www.styled-components.com).

This is an example of how a component is defined in the library:
```jsx static
import styled from 'styled-components'
import as, { Base } from 'reakit'

const Box = styled(Base)`
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 0.25em;
`

export default as('div')(Box)
```

<br />

Then, you can easily extend `Box` and apply new styles:
```jsx static
import { styled, Box } from 'reakit'

const MyBox = styled(Box)`
  background-color: palevioletred;
`
```

Another way to style your enhanced components is by passing style props:
```jsx static
<Box absolute backgroundColor="palevioletred" color="white" />
```

`absolute` is a shorthand for `position="absolute"`. Those styles will be converted into `style={{ ... }}` and applied as inline styles.

Finally, you can pass a theme object to `ThemeProvider` and style ReaKit elements directly:

```jsx
const { ThemeProvider, Button } = require("reakit");

const theme = {
  Button: `
    color: red;
  `
};

<ThemeProvider theme={theme}>
  <Button>Button</Button>
</ThemeProvider>
```