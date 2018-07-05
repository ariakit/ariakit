```jsx
import { Block } from "reakit";

<Step.Container>
  {({ show, ...step }) => (
    <Block>
      <Step.Show step="1" show={show}>Show</Step.Show>
      <Step step="1" {...step}>Step 1</Step>
    </Block>
  )}
</Step.Container>
```
