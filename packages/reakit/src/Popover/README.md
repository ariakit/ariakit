---
path: /docs/popover
redirect_from:
  - /components/popover
  - /components/popover/popovercontainer
  - /components/popover/popoverhide
  - /components/popover/popovershow
  - /components/popover/popovertoggle
---

# Popover

```jsx
import React from "react";
import {
  Popover,
  PopoverArrow,
  PopoverDisclosure,
  PopoverHide,
  usePopoverState
} from "reakit";
import { A } from "reakit-system-classic/components";

function Example() {
  const focusInRef = React.useRef();
  const popover = usePopoverState();
  return (
    <div style={{ padding: 100 }}>
      <PopoverDisclosure {...popover}>Disclosure</PopoverDisclosure>
      <Popover style={{ width: 100, background: "pink" }} {...popover}>
        <PopoverArrow {...popover} />
        dsada
      </Popover>
      <input />
    </div>
  );
}
```

```jsx
import React from "react";
import {
  Popover,
  PopoverArrow,
  PopoverDisclosure,
  PopoverHide,
  PopoverBackdrop,
  usePopoverState
} from "reakit";
import { A } from "reakit-system-classic/components";

function Example() {
  const focusInRef = React.useRef();
  const popover = usePopoverState();
  return (
    <div style={{ padding: 100 }}>
      <PopoverDisclosure {...popover}>Disclosure</PopoverDisclosure>
      <PopoverBackdrop {...popover} />
      <Popover style={{ width: 100, background: "pink" }} {...popover}>
        <PopoverArrow {...popover} />
        dsada
      </Popover>
      <input />
    </div>
  );
}
```
