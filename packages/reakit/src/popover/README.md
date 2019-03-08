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
import { Popover, PopoverToggle, PopoverHide, usePopoverState } from "reakit";
import { A } from "reakit-system-classic/components";

function Example() {
  const focusInRef = React.useRef();
  const popover = usePopoverState();
  return (
    <div style={{ padding: 100 }}>
      <PopoverToggle {...popover}>Toggle</PopoverToggle>
      <Popover
        style={{ width: 100, background: "pink" }}
        unstable_focusOnShow={focusInRef}
        {...popover}
      >
        <PopoverHide ref={focusInRef} {...popover}>
          X
        </PopoverHide>
        <A href="#">test</A>
      </Popover>
      <input />
    </div>
  );
}
```
