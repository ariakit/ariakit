---
path: /docs/popover
redirect_from:
  - /components/popover
  - /components/popover/popovercontainer
  - /components/popover/popoverhide
  - /components/popover/popovershow
  - /components/popover/popovertoggle
---

# Dialog

```jsx
import React from "react";
import { Popover, usePopoverState, Button } from "reakit";
import { A } from "reakit-system-classic/components";

function Example() {
  const popover = usePopoverState();
  return (
    <>
      <Button onClick={popover.toggle}>Toggle</Button>
      <Popover {...popover}>test</Popover>
    </>
  );
}
```
