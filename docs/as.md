`as` is one of the most powerful functions of ReaKit. This leverages composability in React and provides a nice way to create new components by composing many others.

Your first contact with `as` will be most probably with the prop, changing the underlying element of a component:
```jsx
import { Button } from "reakit";

<Button as="a" href="https://github.com/reakit/reakit" target="_blank">
  Go to GitHub
</Button>
```

You can pass HTML string elements, other React components or an array of both.

You can use the `as` enhancer to create new components and take advantage of all ReaKit features:

```jsx
import { as, Button } from 'reakit'

const MyComponent = as("span")(
  ({ as: T, ...props }) => <T {...props} />
);

<MyComponent 
  as={[Button, "a"]} 
  href="https://github.com/reakit/reakit" 
  target="_blank"
>
  GitHub
</MyComponent>
```

That means you can also use it to enhance a ReaKit component with `as` and change what it renders:

```jsx
import { as, Button } from 'reakit'

const LinkButton = as("a")(Button);

<LinkButton href="https://github.com/reakit/reakit" target="_blank">
  GitHub
</LinkButton>
```

Finally, all enhanced components expose an `as` static method, which has the same API as the other versions:

```jsx
import { Button } from "reakit";

const LinkButton = Button.as("a");

<LinkButton href="https://github.com/reakit/reakit" target="_blank">
  GitHub
</LinkButton>
```