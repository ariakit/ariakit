`use` is one of the most powerful functions of Reakit. This leverages composability in React and provides a nice way to create new components by composing many others.

Your first contact with `use` will be most probably with the prop, changing the underlying element of a component:
```jsx
import { Button } from "reakit";

<Button use="a" href="https://github.com/reakit/reakit" target="_blank">
  Go to GitHub
</Button>
```

You can pass HTML string elements, other React components or an array of both.

You can use the `use` enhancer to create new components and take advantage of all Reakit features:

```jsx
import { use, Button } from 'reakit'

const MyComponent = use(({ use: T, ...props }) => <T {...props} />, "span");

<MyComponent 
  use={[Button, "a"]} 
  href="https://github.com/reakit/reakit" 
  target="_blank"
>
  GitHub
</MyComponent>
```

That means you can also use it to enhance a Reakit component with `use` and change what it renders:

```jsx
import { use, Button } from 'reakit'

const LinkButton = use(Button, "a");

<LinkButton href="https://github.com/reakit/reakit" target="_blank">
  GitHub
</LinkButton>
```
