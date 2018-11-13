Here's a destructured version of the example you saw on [Step](Step.md):

```jsx
import { Block, Group, Button, Step } from "reakit";

<Step.Container initialState={{ current: 0 }}>
  {({
    previous,
    hasPrevious,
    next,
    hasNext,
    register,
    unregister,
    isCurrent
  }) => (
    <Block>
      <Group>
        <Button 
          use={Step.Previous} 
          previous={previous}
          hasPrevious={hasPrevious}
        >
          Previous
        </Button>
        <Button 
          use={Step.Next} 
          next={next}
          hasNext={hasNext}
        >
          Next
        </Button>
      </Group>
      <Step
        step="Step 1"
        register={register}
        unregister={unregister}
        isCurrent={isCurrent}
      >
        Step 1
      </Step>
      <Step
        step="Step 2"
        register={register}
        unregister={unregister}
        isCurrent={isCurrent}
      >
        Step 2
      </Step>
      <Step
        step="Step 3"
        register={register}
        unregister={unregister}
        isCurrent={isCurrent}
      >
        Step 3
      </Step>
    </Block>
  )}
</Step.Container>
```
