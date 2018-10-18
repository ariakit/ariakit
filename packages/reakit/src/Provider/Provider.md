`Provider` is a [ThemeProvider](https://www.styled-components.com/docs/advanced#theming) from [Styled Components](https://www.styled-components.com/) and also supports all the [Provider](https://github.com/diegohaz/constate#provider) API from [Constate](https://github.com/diegohaz/constate).

You can pass it a `theme` prop to style your components.
Use the component name in uppercase as a key.

```jsx
import { Provider, Button } from 'reakit';

const theme = {
  Button: {
    backgroundColor: "palevioletred",
    color: "white"
  }
};

<Provider theme={theme}>
  <Button>Themed Button</Button>
</Provider>
```

`Provider` supports the [Constate API](https://github.com/diegohaz/constate#provider) which makes [React Context](https://reactjs.org/docs/context.html) easier to use.

```jsx
import { Container, Provider, Container } from "reakit";

const initial = {
  Button: {
    text: "Awesome context"
  }
};

<Provider initialState={initial}>
  <Container context="Button">
    {({ text }) => <Button>{text} Button</Button>}
  </Container>
</Provider>
```
