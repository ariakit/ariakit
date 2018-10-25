> Reakit uses [reuse](https://github.com/diegohaz/reuse) to compose components.

React components are inherently composable. Reakit makes them even more so with the `use` feature.

You can use the `use` prop just to change the underlying HTML element of a component. A common example is rendering a [Button](../packages/reakit/src/Button/Button.md) as a link:

```jsx
import { Button } from "reakit";

<Button use="a" href="https://github.com/reakit/reakit" target="_blank">
  GitHub
</Button>
```

You can pass string elements, other React components or an array of both. You can also take advantage of the `use` factory to create new components:

```jsx
import { use, Button } from "reakit";

// create a generic component that receives a `use` prop
const Box = ({ use: T, ...props }) => <T {...props} />;

// render the component as a `span`
const UseBox = use(Box, "span");

// replace span by Button, and render it as `a`
<UseBox
  use={[Button, "a"]}
  href="https://github.com/reakit/reakit"
  target="_blank"
>
  GitHub
</UseBox>
```

That means you can also use it to enhance a Reakit component changing what it renders:

```jsx
import { use, Button } from 'reakit'

const LinkButton = use(Button, "a");

<LinkButton href="https://github.com/reakit/reakit" target="_blank">
  GitHub
</LinkButton>
```

We can leverage it even more by combining atomic components created with [styled](styling.md):

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
  <ButtonLarge use={ButtonRounded}>Large + Rounded</ButtonLarge>
  <ButtonRounded use={ButtonPrimary}>Rounded + Primary</ButtonRounded>
  <ButtonLarge use={ButtonPrimary}>Large + Primary</ButtonLarge>
  <ButtonLarge use={[ButtonRounded, ButtonPrimary]}>
    Large + Rounded + Primary
  </ButtonLarge>
</Grid>
```
