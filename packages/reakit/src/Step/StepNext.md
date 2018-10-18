```jsx
import { Block, Step } from "reakit";

<Step.Container>
  {({ next, hasNext, ...step }) => (
    <Block>
      <Step.Next next={next} hasNext={hasNext}>Next</Step.Next>
      <Step step="1" {...step}>Step 1</Step>
      <Step step="2" {...step}>Step 2</Step>
      <Step step="3" {...step}>Step 3</Step>
    </Block>
  )}
</Step.Container>
```
