---
path: /docs/dialog/
redirect_from:
  - /components/overlay/
  - /components/overlay/overlaycontainer/
  - /components/overlay/overlayhide/
  - /components/overlay/overlayshow/
  - /components/overlay/overlaytoggle/
  - /components/backdrop/
  - /components/sidebar/
  - /components/sidebar/sidebarcontainer/
  - /components/sidebar/sidebarhide/
  - /components/sidebar/sidebarshow/
  - /components/sidebar/sidebartoggle/
---

# Dialog (Modal)

Accessible `Dialog` component that follows the [WAI-ARIA Dialog (Modal) Pattern](https://www.w3.org/TR/wai-aria-practices/#dialog_modal). It's rendered within a [Portal](/docs/portal/) by default, but it also has a [non-modal state](#non-modal-dialogs), which doesn't use portals.

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import { useDialogState, Dialog, DialogDisclosure } from "reakit/Dialog";

function Example() {
  const dialog = useDialogState();
  return (
    <>
      <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
      <Dialog {...dialog} aria-label="Welcome">
        Welcome to Reakit!
      </Dialog>
    </>
  );
}
```

### Backdrop

You can use the `DialogBackdrop` component to render a backdrop for the dialog.

```jsx
import { Portal } from "reakit/Portal";
import {
  useDialogState,
  Dialog,
  DialogDisclosure,
  DialogBackdrop
} from "reakit/Dialog";

function Example() {
  const dialog = useDialogState();
  return (
    <>
      <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
      <Portal>
        <DialogBackdrop {...dialog} />
      </Portal>
      <Dialog {...dialog} aria-label="Welcome">
        Welcome to Reakit!
      </Dialog>
    </>
  );
}
```

### Initial focus

When opening `Dialog`, focus is usually set on the first tabbable element within the dialog, including itself. So, if you want to set the initial focus on the dialog element, you can simply pass `tabIndex={0}` to it. It'll be also included in the tab order.

```jsx
import { Button } from "reakit/Button";
import { useDialogState, Dialog, DialogDisclosure } from "reakit/Dialog";

function Example() {
  const dialog = useDialogState();
  return (
    <>
      <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
      <Dialog {...dialog} tabIndex={0} aria-label="Welcome">
        <Button onClick={dialog.hide}>Close</Button>
      </Dialog>
    </>
  );
}
```

Alternatively, you can define another element to get the initial focus with React hooks:

```jsx
import React from "react";
import { Button } from "reakit/Button";
import { useDialogState, Dialog, DialogDisclosure } from "reakit/Dialog";

function Example() {
  const dialog = useDialogState();
  const ref = React.useRef();

  React.useEffect(() => {
    if (dialog.visible) {
      ref.current.focus();
    }
  }, [dialog.visible]);

  return (
    <>
      <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
      <Dialog {...dialog} aria-label="Welcome">
        <Button>By default, initial focus would go here</Button>
        <br />
        <br />
        <Button ref={ref}>But now it goes here</Button>
      </Dialog>
    </>
  );
}
```

### Non-modal dialogs

There's still no consensus on how non-modal dialogs should behave. Some discussions like [w3c/aria-practices#599](https://github.com/w3c/aria-practices/issues/599) and [this deleted section about non-modal dialogs](https://rawgit.com/w3c/aria-practices/master/aria-practices-DeletedSectionsArchive.html#dialog_nonmodal) indicate that it's pretty much a dialog that provides a keyboard mechanism to move focus outside it while leaving it open.

Reakit doesn't strictly follow that. When `Dialog` has `modal` set to `false`:

- It doesn't render within a Portal.
- Focus is not trapped within the dialog.
- Body scroll isn't disabled.

There's a few use cases for these conditions, like [Popover](/docs/popover/) and [Menu](/docs/menu/).

```jsx
import { useDialogState, Dialog, DialogDisclosure } from "reakit/Dialog";

function Example() {
  const dialog = useDialogState();
  return (
    <>
      <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
      <Dialog
        {...dialog}
        aria-label="Welcome"
        modal={false}
        style={{ position: "static", transform: "none" }}
      >
        Focus is not trapped within me.
      </Dialog>
    </>
  );
}
```

### Chat dialog

If desirable, a non-modal dialog can also be rendered within a [Portal](/docs/portal/). The `hideOnClickOutside` prop can be set to `false` so clicking and focusing outside doesn't close it.

```jsx
import { useDialogState, Dialog, DialogDisclosure } from "reakit/Dialog";
import { Button } from "reakit/Button";
import { Portal } from "reakit/Portal";

function Example() {
  const dialog = useDialogState();
  return (
    <>
      <DialogDisclosure {...dialog}>Open chat</DialogDisclosure>
      <Portal>
        <Dialog
          {...dialog}
          aria-label="Welcome"
          modal={false}
          hideOnClickOutside={false}
          style={{
            transform: "none",
            top: "auto",
            left: "auto",
            bottom: 0,
            right: 16,
            width: 200,
            height: 300
          }}
        >
          <Button onClick={dialog.hide}>Close chat</Button>
        </Dialog>
      </Portal>
    </>
  );
}
```

### Nested dialogs

Reakit supports multiple nested modal dialogs and non-modal dialogs. <kbd>ESC</kbd> closes only the currently focused one. If the closed dialog has other open dialogs within, they will all be closed.

```jsx
import { useDialogState, Dialog, DialogDisclosure } from "reakit/Dialog";
import { Button } from "reakit/Button";

function Example() {
  const dialog1 = useDialogState();
  const dialog2 = useDialogState();
  return (
    <>
      <DialogDisclosure {...dialog1}>Open dialog</DialogDisclosure>
      <Dialog {...dialog1} aria-label="Test">
        <p>
          Press <kbd>ESC</kbd> to close me.
        </p>
        <div style={{ display: "grid", gridGap: 16, gridAutoFlow: "column" }}>
          <Button onClick={dialog1.hide}>Close dialog</Button>
          <DialogDisclosure {...dialog2}>Open nested dialog</DialogDisclosure>
        </div>
        <Dialog {...dialog2} aria-label="Nested">
          <Button onClick={dialog2.hide}>Close nested dialog</Button>
        </Dialog>
      </Dialog>
    </>
  );
}
```

### Alert dialogs

A dialog can be turned into an alert dialog by just setting its `role` prop to `alertdialog`. See [WAI-ARIA Alert and Message Dialogs Pattern](https://www.w3.org/TR/wai-aria-practices/#alertdialog).

<!-- eslint-disable no-alert -->

```jsx
import { useDialogState, Dialog, DialogDisclosure } from "reakit/Dialog";
import { Button } from "reakit/Button";

function Example() {
  const dialog = useDialogState();
  return (
    <>
      <DialogDisclosure {...dialog}>Discard</DialogDisclosure>
      <Dialog {...dialog} role="alertdialog" aria-label="Confirm discard">
        <p>Are you sure you want to discard it?</p>
        <div style={{ display: "grid", gridGap: 16, gridAutoFlow: "column" }}>
          <Button onClick={dialog.hide}>Cancel</Button>
          <Button
            onClick={() => {
              alert("Discarded");
              dialog.hide();
            }}
          >
            Discard
          </Button>
        </div>
      </Dialog>
    </>
  );
}
```

### Abstracting

You can build your own `Dialog` component with a different API on top of Reakit.

```jsx
import React from "react";
import {
  useDialogState,
  Dialog as BaseDialog,
  DialogDisclosure
} from "reakit/Dialog";

function Dialog({ disclosure, ...props }) {
  const dialog = useDialogState();
  return (
    <>
      <DialogDisclosure {...dialog}>
        {disclosureProps =>
          React.cloneElement(React.Children.only(disclosure), disclosureProps)
        }
      </DialogDisclosure>
      <BaseDialog {...dialog} {...props} />
    </>
  );
}

function Example() {
  return (
    <Dialog disclosure={<button>Open custom dialog</button>}>
      My custom dialog
    </Dialog>
  );
}
```

## Accessibility

- `Dialog` has role `dialog`.
- `Dialog` has `aria-modal` set to `true` unless the `modal` prop is set to `false`.
- When `Dialog` opens, focus moves to an element inside the dialog.
- Focus is trapped within the modal `Dialog`.
- <kbd>ESC</kbd> closes `Dialog` unless `hideOnEsc` is set to `false`.
- Clicking outside the `Dialog` closes it unless `hideOnClickOutside` is set to `false`.
- Focusing outside the non-modal `Dialog` closes it unless `hideOnClickOutside` is set to `false`.
- When `Dialog` closes, focus returns to its disclosure unless the closing action has been triggered by a click/focus on a tabbable element outside the `Dialog`. In this case, `Dialog` closes and this element remains with focus.
- `DialogDisclosure` extends the accessibility features of [HiddenDisclosure](/docs/hidden/#accessibility).

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Dialog` uses [Hidden](/docs/hidden/), and is used by [Popover](/docs/popover/) and its derivatives.
- `DialogDisclosure` uses [HiddenDisclosure](/docs/hidden/), and is used by [PopoverDisclosure](/docs/popover/) and its derivatives.
- `DialogBackdrop` uses [Hidden](/docs/hidden/), and is used by [PopoverBackdrop](/docs/popover/) and its derivatives.

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useDialogState`

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`unstable_animated`** <span title="Experimental">⚠️</span>
  <code>number | boolean</code>

  If `true`, `animating` will be set to `true` when `visible` changes.
It'll wait for `stopAnimation` to be called or a CSS transition ends.
If it's a number, `stopAnimation` will be called automatically after
given milliseconds.

### `Dialog`

- **`modal`**
  <code>boolean | undefined</code>

  Toggles Dialog's `modal` state.
  - Non-modal: `preventBodyScroll` doesn't work and focus is free.
  - Modal: `preventBodyScroll` is automatically enabled, focus is
trapped within the dialog and the dialog is rendered within a `Portal`
by default.

- **`hideOnEsc`**
  <code>boolean | undefined</code>

  When enabled, user can hide the dialog by pressing `Escape`.

- **`hideOnClickOutside`**
  <code>boolean | undefined</code>

  When enabled, user can hide the dialog by clicking outside it.

- **`preventBodyScroll`**
  <code>boolean | undefined</code>

  When enabled, user can't scroll on body when the dialog is visible.
This option doesn't work if the dialog isn't modal.

- **`unstable_initialFocusRef`** <span title="Experimental">⚠️</span>
  <code>RefObject&#60;HTMLElement&#62; | undefined</code>

  The element that will be focused when the dialog shows.
When not set, the first tabbable element within the dialog will be used.

- **`unstable_finalFocusRef`** <span title="Experimental">⚠️</span>
  <code>RefObject&#60;HTMLElement&#62; | undefined</code>

  The element that will be focused when the dialog hides.
When not set, the disclosure component will be used.

- **`unstable_portal`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Whether or not the dialog should be rendered within `Portal`.
It's `true` by default if `modal` is `true`.

- **`unstable_orphan`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Whether or not the dialog should be a child of its parent.
Opening a nested orphan dialog will close its parent dialog if
`hideOnClickOutside` is set to `true` on the parent.
It will be set to `false` if `modal` is `false`.

<details><summary>4 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`unstable_animated`** <span title="Experimental">⚠️</span>
  <code>number | boolean</code>

  If `true`, `animating` will be set to `true` when `visible` changes.
It'll wait for `stopAnimation` to be called or a CSS transition ends.
If it's a number, `stopAnimation` will be called automatically after
given milliseconds.

- **`unstable_stopAnimation`** <span title="Experimental">⚠️</span>
  <code>() =&#62; void</code>

  Stops animation. It's called automatically if there's a CSS transition.
It's called after given milliseconds if `animated` is a number.

- **`hide`**
  <code>() =&#62; void</code>

  Changes the `visible` state to `false`

</details>

### `DialogBackdrop`

<details><summary>3 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`unstable_animated`** <span title="Experimental">⚠️</span>
  <code>number | boolean</code>

  If `true`, `animating` will be set to `true` when `visible` changes.
It'll wait for `stopAnimation` to be called or a CSS transition ends.
If it's a number, `stopAnimation` will be called automatically after
given milliseconds.

- **`unstable_stopAnimation`** <span title="Experimental">⚠️</span>
  <code>() =&#62; void</code>

  Stops animation. It's called automatically if there's a CSS transition.
It's called after given milliseconds if `animated` is a number.

</details>

### `DialogDisclosure`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

<details><summary>2 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`toggle`**
  <code>() =&#62; void</code>

  Toggles the `visible` state

</details>
