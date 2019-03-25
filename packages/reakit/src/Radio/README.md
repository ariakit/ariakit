---
path: /docs/radio
---

# Radio

## Usage

```jsx
import {
  unstable_Radio as Radio,
  RadioGroup,
  unstable_useRadioState as useRadioState
} from "reakit";

function Example() {
  const radio = useRadioState();
  return (
    <RadioGroup aria-label="fruits" {...radio}>
      <label>
        <Radio {...radio} value="apple" /> apple
      </label>
      <label>
        <Radio {...radio} value="orange" /> orange
      </label>
      <label>
        <Radio {...radio} value="watermelon" /> watermelon
      </label>
    </RadioGroup>
  );
}
```
