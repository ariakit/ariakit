---
path: /docs/styling/
redirect_from:
  - /guide/styling/
  - /guide/theming/
---

# Styling

Reakit doesn't depend on any CSS library. Components are unstyled by default. So you're free to use whatever approach you want. Each component returns a single HTML element that accepts all HTML props, including `className` and `style`.

<carbon-ad></carbon-ad>

## Unstyled

Reakit components are unstyled by default:

```jsx unstyled
import { Button } from "reakit";

function Example() {
  return <Button>Button</Button>;
}
```

## Inline styles

Just use the `style` prop.

```jsx
import { Button } from "reakit";

function Example() {
  return <Button style={{ color: "white", background: "red" }}>Button</Button>;
}
```

## CSS Modules

Assuming you've set up CSS modules (default in create-react-app but easy to hand roll via [css-loader](https://webpack.js.org/loaders/css-loader/#modules)), you can simply import your css module and apply to `className`.

```jsx static
import { Button } from "reakit";
import styles from "./Example.module.css";

function Example() {
  return <Button className={styles.buttonStyles}>Button</Button>;
}
```

## CSS in JS

Example with emotion:

```jsx
import { Button } from "reakit";
import { css } from "emotion";

function Example() {
  return (
    <Button
      className={css({
        color: "white",
        background: "red",
        "&:not([disabled]):hover": { background: "green" },
        "&:not([disabled]):active": { background: "blue" },
      })}
    >
      Button
    </Button>
  );
}
```

Example with styled-components:

> When using styled-components, you will have to use [`forwardedAs` prop](https://styled-components.com/docs/api#forwardedas-prop) instead of Reakit [`as` prop](https://reakit.io/docs/composition/#as-prop) since styled-components have their own built-in `as` prop. Otherwise, you can use [render props](https://reakit.io/docs/composition/#render-props) to achieve the same functionality

```jsx static
import { Button } from "reakit";
import styled from "styled-components";

const StyledButton = styled(Button)`
  color: white;
  background: red;
  &:not([disabled]):hover {
    background: green;
  }

  &:not([disabled]):active {
    background: blue;
  }
`;

function Example() {
  return <StyledButton>Button</StyledButton>;
}
```
