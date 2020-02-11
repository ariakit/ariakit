---
path: /docs/tooltip/
redirect_from:
  - /components/tooltip/
  - /components/tooltip/tooltiparrow/
---

# Tooltip

`Tooltip` follows the [WAI-ARIA Tooltip Pattern](https://www.w3.org/TR/wai-aria-practices/#tooltip). It's a popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import { Button } from "reakit/Button";
import { Tooltip, TooltipReference, useTooltipState } from "reakit/Tooltip";

function Example() {
  const tooltip = useTooltipState();
  return (
    <>
      <TooltipReference {...tooltip} as={Button}>
        Reference
      </TooltipReference>
      <Tooltip {...tooltip}>Tooltip</Tooltip>
    </>
  );
}
```

### Placement

Since `Tooltip` is composed by [Popover](/docs/popover/), you can control how it is positioned by setting the `placement` option on `useTooltipState`.

```jsx
import { Button } from "reakit/Button";
import { Tooltip, TooltipReference, useTooltipState } from "reakit/Tooltip";

function Example() {
  const tooltip = useTooltipState({ placement: "bottom-end" });
  return (
    <>
      <TooltipReference {...tooltip} as={Button}>
        Reference
      </TooltipReference>
      <Tooltip {...tooltip}>Tooltip</Tooltip>
    </>
  );
}
```

### Multiple tooltips

Each group of `Tooltip` and `TooltipReference` should have its own corresponding `useTooltipState`.

```jsx
import { Button } from "reakit/Button";
import { Tooltip, TooltipReference, useTooltipState } from "reakit/Tooltip";

function Example() {
  const tooltip1 = useTooltipState();
  const tooltip2 = useTooltipState();
  return (
    <>
      <TooltipReference {...tooltip1} as={Button}>
        Reference 1
      </TooltipReference>
      <Tooltip {...tooltip1}>Tooltip 1</Tooltip>
      <TooltipReference {...tooltip2} as={Button}>
        Reference 2
      </TooltipReference>
      <Tooltip {...tooltip2}>Tooltip 2</Tooltip>
    </>
  );
}
```

### Abstracting

You can build your own `Tooltip` component with a different API on top of Reakit.

```jsx
import React from "react";
import {
  useTooltipState,
  Tooltip as ReakitTooltip,
  TooltipReference
} from "reakit/Tooltip";

function Tooltip({ children, title, ...props }) {
  const tooltip = useTooltipState();
  return (
    <>
      <TooltipReference {...tooltip} {...children.props}>
        {referenceProps => React.cloneElement(children, referenceProps)}
      </TooltipReference>
      <ReakitTooltip {...tooltip} {...props}>
        {title}
      </ReakitTooltip>
    </>
  );
}

function Example() {
  return (
    <Tooltip title="Tooltip">
      <button>Reference</button>
    </Tooltip>
  );
}
```

## Accessibility

- `Tooltip` has role `tooltip`.
- `TooltipReference` has `aria-describedby` referring to `Tooltip`.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Tooltip` uses [DisclosureContent](/docs/disclosure/).
- `TooltipArrow` uses [PopoverArrow](/docs/popover/).
- `TooltipReference` uses [Box](/docs/box/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useTooltipState`

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

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

- **`unstable_offset`** <span title="Experimental">⚠️</span>
  <code>[string | number, string | number] | undefined</code>

  Offset between the reference and the popover: [main axis, alt axis]. Should not be combined with `gutter`.

- **`gutter`**
  <code>number | undefined</code>

  Offset between the reference and the popover on the main axis. Should not be combined with `unstable_offset`.

- **`unstable_preventOverflow`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Prevents popover from being positioned outside the boundary.

### `Tooltip`

- **`id`**
  <code>string | undefined</code>

  Same as the HTML attribute.

- **`unstable_portal`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Whether or not the dialog should be rendered within `Portal`.
It's `true` by default if `modal` is `true`.

<details><summary>4 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

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

### `TooltipArrow`

- **`size`**
  <code>string | number | undefined</code>

  Arrow's size

<details><summary>1 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`placement`**
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.

</details>

### `TooltipReference`

<details><summary>4 state props</summary>

> These props are returned by the state hook. You can spread them into this component (`{...state}`) or pass them separately. You can also provide these props from your own state logic.

- **`baseId`**
  <code>string</code>

  ID that will serve as a base for all the items IDs.

- **`unstable_referenceRef`** <span title="Experimental">⚠️</span>
  <code>RefObject&#60;HTMLElement | null&#62;</code>

  The reference element.

- **`show`**
  <code>() =&#62; void</code>

  Changes the `visible` state to `true`

- **`hide`**
  <code>() =&#62; void</code>

  Changes the `visible` state to `false`

</details>
