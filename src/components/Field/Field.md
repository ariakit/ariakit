<!-- Description -->

Field is a wrapper for anything, but optimized for form elements.
Specially things that come in pairs, like `<label>` and `<input>`.

<!-- Minimal JSX to showcase component -->

```jsx
const { Label, Input } = require("reas");

<Field>
  <Label htmlFor="input1">Username</Label>
  <Input id="input1" placeholder="Please type username" />
</Field>;
```

Rendered HTML.

```html
<div class="Field-fbEhIC lcdOuj Base-gxTqDr bCPnxv">
  <label class="Label-bxMjsr cAGeQq Base-gxTqDr bCPnxv" for="input1">Username</label>
  <input class="Input-hxTtdt edhqsy Box-cwadsP gAhprV Base-gxTqDr bCPnxv" id="input1" placeholder="Billy White"
    type="text">
</div>
```

<!-- while(not done) { Prop explanation, examples } -->

<!-- Cool styling example -->

Field wrapping a Group.

```jsx
const { Label, Group, Button, Input } = require("reas");

<Field>
  <Label htmlFor="input2">Organize</Label>
  <Group>
    <Button>Left</Button>
    <Input id="input2" placeholder="Please type a piece of clothing" />
    <Button>Right</Button>
  </Group>
</Field>;
```

Field `as="Box"`, styled via props.

```jsx
const { Box, Label, Input } = require("reas");

<Field as={Box} padding={8} backgroundColor="rgb(49.9%, 72.5%, 44.9%)">
  <Label htmlFor="input3">How do you feel looking at green?</Label>
  <Input id="input3" placeholder="I feel..." backgroundColor="rgb(65.1%, 87.3%, 60.2%)"/>
</Field>;
```
