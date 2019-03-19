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
  DialogDisclosure,
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
    maxHeight: 100,
    overflow: "auto",
    border: "2px solid red",
    "-webkit-overflow-scrolling": "touch"
  };
  const backdropStyle = {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: "rgba(0, 0, 0, 0.5)"
  };
  return (
    <>
      <Button ref={focusOutRef}>Focus out</Button>
      <DialogDisclosure {...dialog}>Show Dialog</DialogDisclosure>
      {/* <DialogBackdrop {...dialog} style={backdropStyle} /> */}
      <Dialog
        modal={false}
        hideOnClickOutside={false}
        style={style}
        aria-label="test"
        {...dialog}
      >
        <Button onClick={dialog.hide}>X</Button>
        <DialogDisclosure {...dialog2}>Show Dialog 2</DialogDisclosure>
        <A href="#" ref={focusInRef}>
          Focus In
        </A>
        <div style={{ height: 500 }}>Hi</div>
        <Dialog hideOnClickOutside={false} style={style} {...dialog2}>
          <div style={{ height: 500 }}>Hi</div>
          <Button>Button</Button>
        </Dialog>
      </Dialog>
    </>
  );
}
```

```jsx
import React from "react";
import {
  Dialog,
  DialogDisclosure,
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
      <DialogDisclosure {...dialog}>Show Dialog</DialogDisclosure>
      <Dialog modal={false} style={style} aria-label="test" {...dialog}>
        <Button onClick={dialog.hide}>X</Button>
        <DialogDisclosure {...dialog2}>Show Dialog 2</DialogDisclosure>
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
