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

`Popover` is a [non-modal dialog](/docs/dialog#non-modal-dialogs) that floats around its disclosure. It's commonly used for displaying additional rich content on top of something.

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started).

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

## Accessibility

- `Popover` extends the accessibility features of [Dialog](/docs/dialog#accessibility).
- `PopoverDisclosure` extends the accessibility features of [DialogDisclosure](/docs/dialog#accessibility).

Learn more in [Accessibility](/docs/accessibility).

## Composition

- `Popover` uses [Dialog](/docs/dialog), and is used by [Menu](/docs/menu).
- `PopoverArrow` uses [Box](/docs/box), and is used by [TooltipArrow](/docs/tooltip).
- `PopoverBackdrop` uses [DialogBackdrop](/docs/dialog).
- `PopoverDisclosure` uses [DialogDisclosure](/docs/dialog), and is used by [MenuDisclosure](/docs/menu).

Learn more in [Composition](/docs/composition#props-hooks).

## Props

<!-- Automatically generated -->

### `usePopoverState`

- **`visible`** 
  <code>boolean</code>

  Whether it's visible or not.  

- **`placement`** 
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.  

- **`unstable_flip`** ⚠️
  <code>boolean | undefined</code>

  Whether or not flip the popover.  

- **`unstable_shift`** ⚠️
  <code>boolean | undefined</code>

  Whether or not shift the popover.  

- **`unstable_gutter`** ⚠️
  <code>number | undefined</code>

  Offset between the reference and the popover.  

### `Popover`

- **`visible`** 
  <code>boolean</code>

  Whether it's visible or not.  

- **`hide`** 
  <code>() =&#62; void</code>

  Changes the `visible` state to `false`  

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

- **`unstable_initialFocusRef`** ⚠️
  <code>RefObject&#60;HTMLElement&#62; | undefined</code>

  The element that will be focused when the dialog shows.
When not set, the first tabbable element within the dialog will be used.  

- **`unstable_finalFocusRef`** ⚠️
  <code>RefObject&#60;HTMLElement&#62; | undefined</code>

  The element that will be focused when the dialog hides.
When not set, the disclosure component will be used.  

- **`unstable_portal`** ⚠️
  <code>boolean | undefined</code>

  Whether or not the dialog should be rendered within `Portal`.
It's `true` by default if `modal` is `true`.  

- **`unstable_orphan`** ⚠️
  <code>boolean | undefined</code>

  Whether or not the dialog should be a child of its parent.
Opening a nested orphan dialog will close its parent dialog if
`hideOnClickOutside` is set to `true` on the parent.
It will be set to `false` if `modal` is `false`.  

### `PopoverArrow`

- **`placement`** 
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.  

### `PopoverBackdrop`

- **`visible`** 
  <code>boolean</code>

  Whether it's visible or not.  

### `PopoverDisclosure`

- **`disabled`** 
  <code>boolean | undefined</code>

  Same as the HTML attribute.  

- **`focusable`** 
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.  

- **`visible`** 
  <code>boolean</code>

  Whether it's visible or not.  

- **`toggle`** 
  <code>() =&#62; void</code>

  Toggles the `visible` state  

- **`unstable_referenceRef`** ⚠️
  <code>RefObject&#60;HTMLElement | null&#62;</code>

  The reference element.  
