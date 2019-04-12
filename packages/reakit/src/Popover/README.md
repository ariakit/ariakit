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
  usePopoverState,
  Dialog,
  DialogDisclosure,
  useDialogState,
  Menu,
  MenuDisclosure,
  MenuItem,
  MenuSeparator,
  useMenuState,
  Button
} from "reakit";

function Example() {
  const focusInRef = React.useRef();
  const popover = usePopoverState();
  const dialog = useDialogState();
  const subdialog = useDialogState();
  const menu = useMenuState();
  return (
    <div style={{ padding: 100 }}>
      <PopoverDisclosure {...popover}>Open Popover</PopoverDisclosure>
      <Popover {...popover}>
        <PopoverArrow {...popover} />
        <Button onClick={popover.hide}>Hide</Button>
        <DialogDisclosure {...dialog}>Open Dialog</DialogDisclosure>
        <Dialog {...dialog}>
          <MenuDisclosure {...menu}>Open Menu</MenuDisclosure>
          <Menu {...menu}>
            <MenuItem {...menu}>New File</MenuItem>
            <MenuItem {...menu}>New Window</MenuItem>
            <MenuSeparator {...menu} />
            <MenuItem {...menu}>
              {props => (
                <DialogDisclosure {...props} {...subdialog}>
                  Open...
                </DialogDisclosure>
              )}
            </MenuItem>
            <Dialog {...subdialog}>
              I&apos;m a Dialog triggered by a menu item. Press ESC to close.
            </Dialog>
          </Menu>
        </Dialog>
      </Popover>
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

function Example() {
  const focusInRef = React.useRef();
  const popover = usePopoverState();
  return (
    <div style={{ padding: 100 }}>
      <PopoverDisclosure {...popover}>Disclosure</PopoverDisclosure>
      <PopoverBackdrop {...popover} />
      <Popover {...popover}>
        <PopoverArrow {...popover} />
        dsada
      </Popover>
      <input />
    </div>
  );
}
```

## Props

<!-- Automatically generated -->

### `usePopoverState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |
| <strong><code>unstable_flip</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Whether or not flip the popover. |
| <strong><code>unstable_shift</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Whether or not shift the popover. |
| <strong><code>unstable_gutter</code>&nbsp;⚠️</strong> | <code>number&nbsp;&#124;&nbsp;undefined</code> | Offset between the reference and the popover. |

### `Popover`

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
| <strong><code>unstable_popoverRef</code>&nbsp;⚠️</strong> | <code>RefObject&#60;HTMLElement&nbsp;&#124;&nbsp;null&#62;</code> | The popover element. |

### `PopoverArrow`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>placement</code>&nbsp;</strong> | <code title="&#34;auto-start&#34; &#124; &#34;auto&#34; &#124; &#34;auto-end&#34; &#124; &#34;top-start&#34; &#124; &#34;top&#34; &#124; &#34;top-end&#34; &#124; &#34;right-start&#34; &#124; &#34;right&#34; &#124; &#34;right-end&#34; &#124; &#34;bottom-end&#34; &#124; &#34;bottom&#34; &#124; &#34;bottom-start&#34; &#124; &#34;left-end&#34; &#124; &#34;left&#34; &#124; &#34;left-start&#34;">&#34;auto&#x2011;start&#34;&nbsp;&#124;&nbsp;&#34;auto&#34;&nbsp;&#124;&nbsp;&#34;au...</code> | Actual `placement`. |

### `PopoverBackdrop`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |

### `PopoverDisclosure`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>unstable_focusable</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>toggle</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Toggles the `visible` state |
| <strong><code>unstable_referenceRef</code>&nbsp;⚠️</strong> | <code>RefObject&#60;HTMLElement&nbsp;&#124;&nbsp;null&#62;</code> | The reference element. |
