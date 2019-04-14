---
path: /docs/dialog
redirect_from:
  - /components/overlay
  - /components/overlay/overlaycontainer
  - /components/overlay/overlayhide
  - /components/overlay/overlayshow
  - /components/overlay/overlaytoggle
  - /components/backdrop
---

# Dialog

## Usage

```jsx
import React from "react";
import {
  Dialog,
  DialogDisclosure,
  DialogBackdrop,
  useDialogState,
  Button
} from "reakit";

function Example() {
  const focusInRef = React.useRef(null);
  const focusOutRef = React.useRef(null);
  const dialog = useDialogState();
  const dialog2 = useDialogState();
  // const style = {
  //   position: "fixed",
  //   top: "50%",
  //   left: "50%",
  //   transform: "translate(-50%, -50%)",
  //   background: "white",
  //   padding: 20,
  //   maxHeight: 100,
  //   overflow: "auto",
  //   border: "2px solid red",
  //   "-webkit-overflow-scrolling": "touch"
  // };
  // const backdropStyle = {
  //   position: "fixed",
  //   top: 0,
  //   right: 0,
  //   bottom: 0,
  //   left: 0,
  //   background: "rgba(0, 0, 0, 0.5)"
  // };
  return (
    <>
      <Button ref={focusOutRef}>Focus out</Button>
      <DialogDisclosure {...dialog}>Show Dialog</DialogDisclosure>
      {/* <DialogBackdrop {...dialog} style={backdropStyle} /> */}
      <Dialog
        modal={false}
        hideOnClickOutside={false}
        aria-label="test"
        {...dialog}
      >
        <Button onClick={dialog.hide}>X</Button>
        <DialogDisclosure {...dialog2}>Show Dialog 2</DialogDisclosure>
        <div style={{ height: 500 }}>Hi</div>
        <Dialog hideOnClickOutside={false} {...dialog2}>
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
        <Dialog style={style} {...dialog2}>
          Hi
        </Dialog>
      </Dialog>
    </>
  );
}
```

## Props

<!-- Automatically generated -->

### `useDialogState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |

### `Dialog`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>hide</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Changes the `visible` state to `false` |
| <strong><code>modal</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Toggles Dialog's `modal` state.<br>  - Non-modal: `preventBodyScroll` doesn't work and focus is free.<br>  - Modal: `preventBodyScroll` is automatically enabled and focus is trapped within the dialog. |
| <strong><code>hideOnEsc</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When enabled, user can hide the dialog by pressing `Escape`. |
| <strong><code>hideOnClickOutside</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When enabled, user can hide the dialog by clicking outside it. |
| <strong><code>preventBodyScroll</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When enabled, user can't scroll on body when the dialog is visible. This option doesn't work if the dialog isn't modal. |
| <strong><code>unstable_initialFocusRef</code>&nbsp;⚠️</strong> | <code title="RefObject&#60;HTMLElement&#62; &#124; undefined">RefObject&#60;HTMLElement&#62;&nbsp;&#124;&nbsp;un...</code> | The element that will be focused when the dialog shows. When not set, the first tabbable element within the dialog will be used. `autoFocusOnShow` disables it. |
| <strong><code>unstable_finalFocusRef</code>&nbsp;⚠️</strong> | <code title="RefObject&#60;HTMLElement&#62; &#124; undefined">RefObject&#60;HTMLElement&#62;&nbsp;&#124;&nbsp;un...</code> | The element that will be focused when the dialog hides. When not set, the disclosure component will be used. `autoFocusOnHide` disables it. |

### `DialogBackdrop`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |

### `DialogDisclosure`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. It works similarly to `readOnly` on form elements. In this case, only `aria-disabled` will be set. |
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>toggle</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Toggles the `visible` state |
