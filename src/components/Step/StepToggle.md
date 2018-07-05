```jsx
import { Block } from "reakit";

<Step.Container>
  {({ toggle, ...step }) => (
    <Block>
      <Step.Toggle step="1" toggle={toggle}>Toggle</Step.Toggle>
      <Step step="1" {...step}>Step 1</Step>
    </Block>
  )}
</Step.Container>
```
