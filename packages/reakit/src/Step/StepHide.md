```jsx
import { Block, Step } from "reakit";

<Step.Container initialState={{ current: 0 }}>
  {({ hide, ...step }) => (
    <Block>
      <Step.Hide hide={hide}>Hide</Step.Hide>
      <Step step="1" {...step}>Step 1</Step>
    </Block>
  )}
</Step.Container>
```
