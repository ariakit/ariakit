---
path: /docs/roving
---

# Roving

## Usage

```jsx
import { useRovingState, Roving } from "reakit";

function Example() {
  const roving = useRovingState({ autoSelect: false, selectedRef: "test" });
  return (
    <>
      <Roving {...roving}>Item 1</Roving>
      <Roving {...roving} disabled>
        Item 2
      </Roving>
      <Roving refId="test" {...roving}>
        Item 3
      </Roving>
      <Roving {...roving}>Item 4</Roving>
      <Roving {...roving}>Item 5</Roving>
    </>
  );
}
```
