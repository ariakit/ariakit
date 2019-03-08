---
path: /docs/dialog
redirect_from:
  - /components/overlay
  - /components/overlay/overlaycontainer
  - /components/overlay/overlayhide
  - /components/overlay/overlayshow
  - /components/overlay/overlaytoggle
---

# Dialog

```jsx
import React from "react";
import {
  Dialog,
  DialogShow,
  DialogHide,
  DialogBackdrop,
  useDialogState,
  Button
} from "reakit";
import { A } from "reakit-system-classic/components";

function Example() {
  const focusInRef = React.useRef(null);
  const focusOutRef = React.useRef(null);
  const dialog = useDialogState();
  const dialog2 = useDialogState();
  const style = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "white",
    padding: 20,
    maxHeight: 50,
    overflow: "auto",
    border: "2px solid red",
    zIndex: 99999
  };
  const backdropStyle = {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 99999,
    background: "rgba(0, 0, 0, 0.5)"
  };
  return (
    <>
      <Button ref={focusOutRef}>Focus out</Button>
      <DialogShow {...dialog}>Show Dialog</DialogShow>
      <Dialog style={style} aria-label="test" {...dialog}>
        <DialogHide {...dialog}>X</DialogHide>
        <DialogShow {...dialog2}>Show Dialog 2</DialogShow>
        <A href="#" ref={focusInRef}>
          Focus In
        </A>
        <Dialog style={style} {...dialog2}>
          Hi
        </Dialog>
      </Dialog>
    </>
  );
}
```
