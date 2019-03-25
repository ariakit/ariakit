---
path: /docs/rover
---

# Rover

## Usage

```jsx
import { useRoverState, Rover } from "reakit";

function Example() {
  const roving = useRoverState({ unstable_currentId: "test" });
  return (
    <>
      <Rover {...roving}>Item 1</Rover>
      <Rover {...roving} disabled>
        Item 2
      </Rover>
      <Rover stopId="test" disabled {...roving}>
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

```jsx
import React from "react";
import { useRoverState, Rover } from "reakit";

function Example() {
  const roving = useRoverState({ unstable_currentId: "test" });
  const [visible, setVisible] = React.useState(false);
  return (
    <>
      <button onClick={() => setVisible(!visible)}>Toggle visible</button>
      <Rover {...roving}>Item 1</Rover>
      <Rover {...roving} disabled>
        Item 2
      </Rover>
      <Rover stopId="test" disabled {...roving}>
        Item 3
      </Rover>
      {visible && <Rover {...roving}>Item 3.5</Rover>}
      <Rover {...roving} disabled unstable_focusable>
        Item 4
      </Rover>
      <Rover {...roving}>Item 5</Rover>
    </>
  );
}
```
