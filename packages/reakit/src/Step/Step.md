`Step` is composed from [Hidden](../Hidden/Hidden.md) as an interactive UI with one or more steps to complete. By default `Step` renders as a `<div>`.

```jsx
import { Block, Group, Button, Step } from "reakit";

<Step.Container initialState={{ current: 0 }}>
  {step => (
    <Block>
      <Group>
        <Button as={Step.Previous} {...step}>Previous</Button>
        <Button as={Step.Next} {...step}>Next</Button>
      </Group>
      <Step step="Step 1" {...step}>Step 1</Step>
      <Step step="Step 2" {...step}>Step 2</Step>
      <Step step="Step 3" {...step}>Step 3</Step>
    </Block>
  )}
</Step.Container>
```
