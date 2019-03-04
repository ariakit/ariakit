---
path: /components/step
---

# Step

## Usage

```jsx
import { useStepState, Step, StepPrevious, StepNext } from "reakit";

function Example() {
  const step = useStepState({ activeIndex: 0 })
  return (
    <>
      <StepPrevious {...step}>Previous</StepPrevious>
      <StepNext {...step}>Next</StepNext>
      <Step stepId="step1" {...step}>Step 1</Step>
      <Step stepId="step2" {...step}>Step 2</Step>
      <Step stepId="step3" {...step}>Step 3</Step>
    </>
  );
}
```
