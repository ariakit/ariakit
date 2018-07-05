Here's a destructured version of the example you saw on [Step](/components/step):

```jsx
import { Block, Group, Button } from "reakit";

<Step.Container initialState={{ current: 0 }}>
  {({
    previous,
    hasPrevious,
    next,
    hasNext,
    current,
    register,
    unregister,
    indexOf
  }) => (
    <Block>
      <Group>
        <Button 
          as={Step.Previous} 
          previous={previous}
          hasPrevious={hasPrevious}
        >
          Previous
        </Button>
        <Button 
          as={Step.Next} 
          next={next}
          hasNext={hasNext}
        >
          Next
        </Button>
      </Group>
      <Step
        step="Step 1"
        current={current}
        register={register}
        unregister={unregister}
        indexOf={indexOf}
      >
        Step 1
      </Step>
      <Step
        step="Step 2"
        current={current}
        register={register}
        unregister={unregister}
        indexOf={indexOf}
      >
        Step 2
      </Step>
      <Step
        step="Step 3"
        current={current}
        register={register}
        unregister={unregister}
        indexOf={indexOf}
      >
        Step 3
      </Step>
    </Block>
  )}
</Step.Container>
```
