---
path: /docs/rover
---

# Rover

## Usage

```jsx
import { useRoverState, Rover } from "reakit";

function Example() {
  const roving = useRoverState({ activeRef: "test" });
  return (
    <>
      <Rover {...roving}>Item 1</Rover>
      <Rover {...roving} disabled>
        Item 2
      </Rover>
      <Rover refId="test" disabled {...roving}>
        Item 3
      </Rover>
      <Rover {...roving} disabled focusable>
        Item 4
      </Rover>
      <Rover {...roving}>Item 5</Rover>
    </>
  );
}
```
