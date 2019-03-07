---
path: /docs/dialog
redirect_from:
  - /components/dialog
---

# Dialog

## Usage

### `Dialog`

```jsx
import React from "react";
import { Dialog, useDialogState, HiddenToggle, Button } from "reakit";
import { A } from "reakit-system-classic/components";

function Example() {
  const focusInRef = React.useRef(null);
  const focusOutRef = React.useRef(null);
  const dialog = useDialogState({ modal: true });
  return (
    <>
      <Button ref={focusOutRef}>Test</Button>
      <HiddenToggle {...dialog}>Toggle</HiddenToggle>
      <Dialog
        aria-label="test"
        unstable_focusOnShow={focusInRef}
        unstable_focusOnHide={focusOutRef}
        {...dialog}
      >
        <Button onClick={dialog.hide}>X</Button>
        Hi
        <A href="#" ref={focusInRef}>
          fooo
        </A>
      </Dialog>
    </>
  );
}
```
