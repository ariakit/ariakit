Reakit components have very few styles. Most of them, actually, don't apply any style. This makes it easier for building UIs from scratch.

But if you don't want to style everything by yourself, you can also install a theme package, like `reakit-theme-default`, and pass it to [Provider](../packages/reakit/src/Provider/Provider.md):

```jsx
import { Provider, Button } from "reakit";
import theme from "reakit-theme-default";

<Provider theme={theme}>
  <Button>Button</Button>
</Provider>
```

That `theme` object is passed to `styled-components`' [ThemeProvider](https://www.styled-components.com/docs/api#themeprovider), so all components enhanced with [`styled`](styling.md) will receive it as a prop.

## Creating a theme

You can create a theme object with a `palette` and customize any Reakit component:

```js static
const theme = {
  palette: {
    primary: ["darkred", "red", "lightred"],
    primaryText: ["white", "white", "black"]
  },

  Button: `
    color: red;
  `
}
```

> The `palette` object is structured so as to work with `styled-tools`' [palette](https://github.com/diegohaz/styled-tools#palette).

Take a look at the `reakit-theme-default`'s [source code](https://github.com/reakit/reakit/blob/master/packages/reakit-theme-default/src/index.ts) to understand better how to write a complete theme.

## Extending a theme

Since it's a plain JavaScript object, you can use the object spread operator to extend a theme and customize it:

```js static
import { css } from "reakit";
import defaultTheme from "reakit-theme-default";

const theme = {
  ...defaultTheme,

  palette: {
    ...defaultTheme.palette,
    primary: ["darkblue", "blue", "lightblue"]
  },

  Button: css`
    ${defaultTheme.Button};
    color: red;
  `
}
```

## Consuming a theme

Within styles, you can use `styled-tools`' [theme](https://github.com/diegohaz/styled-tools#theme) and [palette](https://github.com/diegohaz/styled-tools#palette) methods to access theme values:

```jsx
import { styled, Box } from "reakit";
import { theme, palette } from "styled-tools";

const Component = styled(Box)`
  background-color: ${palette("primary", "red")};
  color: ${palette("primaryText", "blue")};
  padding: ${theme("innerSpacing", "16px")};
`;

<Component>Component</Component>
```
