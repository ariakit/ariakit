<!-- Description -->

Group gives visual unity to elements that work together.
It **doesn't** add borders, only adjusts `border-radius` of its children.

<!-- Minimal JSX to showcase component -->

```jsx
const { Button } = require("reas");

<Group>
  <Button>Ok</Button>
  <Button>Cancel</Button>
</Group>;
```

Rendered HTML.

```html
<div class="Group-gLBQNJ lhodrV Base-gxTqDr bCPnxv" role="group">
  <div class="Button-kDSBcD eMpnqe Box-cwadsP gAhprV Base-gxTqDr bCPnxv" role="button" tabindex="0">
    Ok
  </div>
  <div class="Button-kDSBcD eMpnqe Box-cwadsP gAhprV Base-gxTqDr bCPnxv" role="button" tabindex="0">
    Cancel
  </div>
</div>
```

<!-- Cool styling example -->

Use handy prop `vertical` to group components vertically.

```jsx
const { Button } = require("reas");

<Group vertical>
  <Button maxWidth="20vmin">Up</Button>
  <Button maxWidth="20vmin">Down</Button>
</Group>;
```

Nesting Group components.
Group applies styling to its direct children, but in case the component isn't a direct child, use `as={Group.Item}`.

```jsx
const { Box, Field, Label, Input, Button, Shadow } = require("reas");

<Box relative border={0}>
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
  <Shadow />
</Box>;
```
