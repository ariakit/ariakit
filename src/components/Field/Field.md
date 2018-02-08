```jsx
const { Label, Input } = require('reas');

<Field>
  <Label htmlFor="input1">Label</Label>
  <Input id="input1" placeholder="Input" />
</Field>
```

```jsx
const { Label, Group, Button, Input } = require('reas');

<Field>
  <Label htmlFor="input2">Label</Label>
  <Group>
    <Button>Button</Button>
    <Input id="input2" placeholder="Input" />
    <Button>Button</Button>
  </Group>
</Field>
```

```jsx
const { Box, Label, Input } = require('reas');

<Field as={Box} padding={8} backgroundColor="rgba(0, 0, 0, 0.03)">
  <Label htmlFor="input3">Label</Label>
  <Input id="input3" placeholder="Input" />
</Field>
```
