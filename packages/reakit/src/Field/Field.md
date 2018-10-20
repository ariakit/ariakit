Field is a wrapper optimized for form elements. Specially things that come in pairs, like `<label>` and `<input>`.

```jsx
import { Label, Input, Field } from "reakit";

<Field>
  <Label htmlFor="input1">Username</Label>
  <Input id="input1" placeholder="Please type username" />
</Field>
```

Field wrapping a Group:

```jsx
import { Label, Group, Button, Input, Field } from "reakit";

<Field>
  <Label htmlFor="input2">Organize</Label>
  <Group>
    <Button>Left</Button>
    <Input id="input2" placeholder="Please type a piece of clothing" />
    <Button>Right</Button>
  </Group>
</Field>
```

Styled via props:

```jsx
import { Label, Input, Field } from "reakit";

<Field padding={8} backgroundColor="rgb(49.9%, 72.5%, 44.9%)">
  <Label htmlFor="input3">How do you feel looking at green?</Label>
  <Input id="input3" placeholder="I feel..." backgroundColor="rgb(65.1%, 87.3%, 60.2%)"/>
</Field>
```
