---
path: /docs/popover/
redirect_from:
  - /components/popover/
  - /components/popover/popoverarrow/
  - /components/popover/popovercontainer/
  - /components/popover/popoverhide/
  - /components/popover/popovershow/
  - /components/popover/popovertoggle/
---

# Popover

`Popover` is a [non-modal dialog](/docs/dialog/#non-modal-dialogs) that floats around its disclosure. It's commonly used for displaying additional rich content on top of something.

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import {
  usePopoverState,
  Popover,
  PopoverDisclosure,
  PopoverArrow
} from "reakit/Popover";

function Example() {
  const popover = usePopoverState();
  return (
    <>
      <PopoverDisclosure {...popover}>Open Popover</PopoverDisclosure>
      <Popover {...popover} aria-label="Welcome">
        <PopoverArrow {...popover} />
        Welcome to Reakit!
      </Popover>
    </>
  );
}
```

### Placement

You can control how `Popover` is positioned by setting the `placement` option on `usePopoverState`.

```jsx
import {
  usePopoverState,
  Popover,
  PopoverDisclosure,
  PopoverArrow
} from "reakit/Popover";

function Example() {
  const popover = usePopoverState({ placement: "right-start" });
  return (
    <>
      <PopoverDisclosure {...popover}>Open Popover</PopoverDisclosure>
      <Popover {...popover} aria-label="Welcome">
        <PopoverArrow {...popover} />
        Welcome to Reakit!
      </Popover>
    </>
  );
}
```

### Gutter

You can control the margin between `Popover` and `PopoverDisclosure` by setting the `gutter` option on `usePopoverState`.

```jsx
import { usePopoverState, Popover, PopoverDisclosure } from "reakit/Popover";

function Example() {
  const popover = usePopoverState({ gutter: 0, placement: "bottom-start" });
  return (
    <>
      <PopoverDisclosure {...popover}>Open Popover</PopoverDisclosure>
      <Popover {...popover} aria-label="Welcome">
        Welcome to Reakit!
      </Popover>
    </>
  );
}
```

### Initial focus

When opening `Popover`, focus is usually set on the first tabbable element within the popover, including itself. So, if you want to set the initial focus on the popover element, you can simply pass `tabIndex={0}` to it. It'll be also included in the tab order.

```jsx
import { Button } from "reakit/Button";
import { usePopoverState, Popover, PopoverDisclosure } from "reakit/Popover";

function Example() {
  const popover = usePopoverState();
  return (
    <>
      <PopoverDisclosure {...popover}>Open Popover</PopoverDisclosure>
      <Popover {...popover} tabIndex={0} aria-label="Welcome">
        <Button onClick={popover.hide}>Close</Button>
      </Popover>
    </>
  );
}
```

Alternatively, you can define another element to get the initial focus with React hooks:

```jsx
import React from "react";
import { Button } from "reakit/Button";
import { usePopoverState, Popover, PopoverDisclosure } from "reakit/Popover";

function Example() {
  const popover = usePopoverState();
  const ref = React.useRef();

  React.useEffect(() => {
    if (popover.visible) {
      ref.current.focus();
    }
  }, [popover.visible]);

  return (
    <>
      <PopoverDisclosure {...popover}>Open Popover</PopoverDisclosure>
      <Popover {...popover} aria-label="Welcome">
        <Button>By default, initial focus would go here</Button>
        <br />
        <br />
        <Button ref={ref}>But now it goes here</Button>
      </Popover>
    </>
  );
}
```

### Abstracting

You can build your own `Popover` component with a different API on top of Reakit.

```jsx
import React from "react";
import {
  usePopoverState,
  Popover as BasePopover,
  PopoverDisclosure,
  PopoverArrow
} from "reakit/Popover";

function Popover({ disclosure, ...props }) {
  const popover = usePopoverState();
  return (
    <>
      <PopoverDisclosure {...popover}>
        {disclosureProps =>
          React.cloneElement(React.Children.only(disclosure), disclosureProps)
        }
      </PopoverDisclosure>
      <BasePopover {...popover} {...props}>
        <PopoverArrow {...popover} />
        {props.children}
      </BasePopover>
    </>
  );
}

function Example() {
  return (
    <Popover
      aria-label="Custom popover"
      disclosure={<button>Open custom popover</button>}
    >
      Custom popover
    </Popover>
  );
}
```

## Accessibility

- `Popover` extends the accessibility features of [Dialog](/docs/dialog/#accessibility).
- `PopoverDisclosure` extends the accessibility features of [DialogDisclosure](/docs/dialog/#accessibility).

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Popover` uses [Dialog](/docs/dialog/), and is used by [Menu](/docs/menu/).
- `PopoverArrow` uses [Box](/docs/box/), and is used by [TooltipArrow](/docs/tooltip/).
- `PopoverBackdrop` uses [DialogBackdrop](/docs/dialog/).
- `PopoverDisclosure` uses [DialogDisclosure](/docs/dialog/), and is used by [MenuDisclosure](/docs/menu/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `usePopoverState`

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`unstable_animated`** <span title="Experimental">⚠️</span>
  <code>number | boolean</code>

  If `true`, `animating` will be set to `true` when `visible` changes.
It'll wait for `stopAnimation` to be called or a CSS transition ends.
If it's a number, `stopAnimation` will be called automatically after
given milliseconds.

- **`placement`**
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.

- **`unstable_fixed`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Whether or not the popover should have `position` set to `fixed`.

- **`unstable_flip`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Flip the popover's placement when it starts to overlap its reference
element.

- **`unstable_shift`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Shift popover on the start or end of its reference element.

- **`gutter`**
  <code>number | undefined</code>

  Offset between the reference and the popover.

- **`unstable_preventOverflow`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Prevents popover from being positioned outside the boundary.

- **`unstable_boundariesElement`** <span title="Experimental">⚠️</span>
  <code>&#34;scrollParent&#34; | &#34;viewport&#34; | &#34;window&#34; | undefined</code>

  Boundaries element used by `preventOverflow`.

### `Popover`

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

### `PopoverArrow`

- **`size`**
  <code>string | number | undefined</code>

  Arrow's size

<details><summary>1 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`placement`**
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.

</details>

### `PopoverBackdrop`

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

### `PopoverDisclosure`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.

<details><summary>3 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`toggle`**
  <code>() =&#62; void</code>

  Toggles the `visible` state

- **`unstable_referenceRef`** <span title="Experimental">⚠️</span>
  <code>RefObject&#60;HTMLElement | null&#62;</code>

  The reference element.

</details>
