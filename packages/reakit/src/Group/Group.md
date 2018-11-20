Group gives visual unity to elements that work together. It **doesn't** add borders, only adjusts `border-radius` of its children.

```jsx
import { Button, Group } from "reakit";

<Group>
  <Button>Ok</Button>
  <Button>Cancel</Button>
</Group>;
```

Use handy prop `vertical` to group components vertically:

```jsx
import { Button, Group } from "reakit";

<Group vertical>
  <Button maxWidth="20vmin">Up</Button>
  <Button maxWidth="20vmin">Down</Button>
</Group>;
```
