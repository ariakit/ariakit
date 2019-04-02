---
path: /docs/theming
redirect_from:
  - /guide/theming
---

# Theming

```jsx
import { Provider, Button } from "reakit";
import * as system from "reakit-system-palette";

function Example() {
  return (
    <Provider unstable_system={system}>
      <Button unstable_system={{ bgColor: "primary.0", color: "primaryText" }}>
        Button
      </Button>
    </Provider>
  );
}
```
