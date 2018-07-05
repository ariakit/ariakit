```jsx
import { Block } from "reakit";

<Step.Container initialState={{ current: 2 }}>
  {({ previous, hasPrevious, ...step }) => (
    <Block>
      <Step.Previous
        previous={previous}
        hasPrevious={hasPrevious}
      >
        Previous
      </Step.Previous>
      <Step step="1" {...step}>Step 1</Step>
      <Step step="2" {...step}>Step 2</Step>
      <Step step="3" {...step}>Step 3</Step>
    </Block>
  )}
</Step.Container>
```
