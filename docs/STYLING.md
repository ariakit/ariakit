---
path: /docs/styling/
redirect_from:
  - /guide/styling/
  - /guide/theming/
---

# Styling

Reakit doesn't depend on any CSS library. Components are unstyled by default. So you're free to use whatever approach you want. Each component returns a single HTML element that accepts all HTML props, including `className` and `style`.

<carbon-ad></carbon-ad>

## Inline styles

Just use the `style` prop.

```jsx
import { Button } from "reakit";

function Example() {
  return <Button style={{ color: "white", background: "red" }}>Button</Button>;
}
```

## CSS in JS

Example with emotion

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
        "&:not([disabled]):active": { background: "blue" }
      })}
    >
      Button
    </Button>
  );
}
```

Example with styled-components

> When using libraries like styled-components, you'll not be able to use the Reakit [`as` prop](https://reakit.io/docs/composition/#as-prop) since styled components have their own built-in `as` prop which is not passed down to the underlying component. You can use [render props](https://reakit.io/docs/composition/#render-props) instead to achieve the same functionality

```jsx
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
