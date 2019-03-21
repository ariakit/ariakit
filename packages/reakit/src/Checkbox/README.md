---
path: /docs/checkbox
---

# Checkbox

## Usage

```jsx
import React from "react";
import { Checkbox, useCheckboxState } from "reakit";

function Example() {
  const checkbox = useCheckboxState();
  return <Checkbox {...checkbox} />;
}
```

```jsx
import React from "react";
import { Checkbox, useCheckboxState } from "reakit";

function Example() {
  const checkbox = useCheckboxState({ state: ["apple"] });

  return (
    <div role="group">
      <Checkbox {...checkbox} value="apple" />
      <Checkbox
        {...checkbox}
        as="div"
        style={{ width: 20, height: 20, background: "red" }}
        value="orange"
      />
      <Checkbox {...checkbox} value="watermelon" />
    </div>
  );
}
```
