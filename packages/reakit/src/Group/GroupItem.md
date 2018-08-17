Group applies styling to its direct children, but in case the component isn't a direct child, you can use `GroupItem`:

```jsx
import { Field, Label, Input, Button } from "reakit";

<Base relative border={0}>
  <Group vertical>
    <Group verticalAt={800}>
      <Field as={Group.Item} padding={8}>
        <Label htmlFor="input">First name</Label>
        <Input id="input" placeholder="..." />
      </Field>
      <Field as={Group.Item} padding={8}>
        <Label htmlFor="input2">Random Nickname</Label>
        <Group>
          <Button>More</Button>
          <Input id="input2" placeholder="..." />
        <Button>Less</Button>
        </Group>
      </Field>
    </Group>
    <Button>Ok</Button>
  </Group>
</Base>
```
