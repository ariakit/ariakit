```jsx
const { Button } = require('reas');

<Group>
  <Button>Button</Button>
  <Button>Button</Button>
  <Button>Button</Button>
</Group>
```

```jsx
const { Button } = require('reas');

<Group vertical>
  <Button>Button</Button>
  <Button>Button</Button>
  <Button>Button</Button>
</Group>
```

```jsx
const { Box, Field, Label, Input, Button, Shadow } = require('reas');

<Box relative border={0}>
  <Group vertical>
    <Group>
      <Field as={Group.Item} padding={8}>
        <Label htmlFor="input">Label</Label>
        <Input id="input" placeholder="Input" />
      </Field>
      <Field as={Group.Item} padding={8}>
        <Label htmlFor="input2">Label</Label>
        <Group>
          <Button>Button</Button>
          <Input id="input2" placeholder="Input" />
          <Button>Button</Button>
        </Group>
      </Field>
    </Group>
    <Button>Button</Button>
  </Group>
  <Shadow />
</Box>
```
