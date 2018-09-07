React components are inherently composable. ReaKit makes them even more so with [as](as.md).

You can use the `as` prop just to change the underlying HTML element of a component. A common example is rendering a [Button](../packages/reakit/src/Button/Button.md) as a link:

```jsx
import { Button } from "reakit";

<Button as="a" href="https://github.com/reakit/reakit" target="_blank">
  GitHub
</Button>
```

However, we can leverage it even more by combining atomic components created with [styled](styling.md):

```jsx
import { styled, Button as BaseButton, Grid } from "reakit";

const Button = styled(BaseButton)`
  text-transform: uppercase;
  font-weight: 600;
`;

const ButtonRounded = styled(Button)`
  border-radius: 1.25em;
  padding: 0 1.375em;
`;

const ButtonLarge = styled(Button)`
  font-size: 20px;
`;

const ButtonPrimary = styled(Button)`
  background-color: #fc4577;
  border: none;
  color: white;
`;

<Grid gap={20} justifyContent="center">
  <Button>Button</Button>
  <ButtonLarge>Large</ButtonLarge>
  <ButtonRounded>Rounded</ButtonRounded>
  <ButtonPrimary>Primary</ButtonPrimary>
  <ButtonLarge as={ButtonRounded}>Large + Rounded</ButtonLarge>
  <ButtonRounded as={ButtonPrimary}>Rounded + Primary</ButtonRounded>
  <ButtonLarge as={ButtonPrimary}>Large + Primary</ButtonLarge>
  <ButtonLarge as={[ButtonRounded, ButtonPrimary]}>
    Large + Rounded + Primary
  </ButtonLarge>
</Grid>
```
