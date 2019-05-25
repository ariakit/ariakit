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
      <TooltipReference as={Button} {...tooltip}>
        Reference
      </TooltipReference>
      <Tooltip {...tooltip}>Tooltip</Tooltip>
    </>
  );
}
```

### Abstracting

If the Reakit's API is too low level for you, you can create your own abstraction to ease your work.

```jsx
import React from "react";
import { Button } from "reakit/Button";
import {
  Tooltip as ReakitTooltip,
  TooltipReference,
  useTooltipState
} from "reakit/Tooltip";

function Tooltip({ children, title, ...props }) {
  const tooltip = useTooltipState();
  return (
    <>
      <TooltipReference {...tooltip}>
        {referenceProps =>
          React.cloneElement(React.Children.only(children), referenceProps)
        }
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
      <Button>Reference</Button>
    </Tooltip>
  );
}
```

## Accessibility

- `Tooltip` has role `tooltip`.
- `TooltipReference` has `aria-describedby` referring to `Tooltip`.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Tooltip` uses [Hidden](/docs/hidden/).
- `TooltipArrow` uses [PopoverArrow](/docs/popover/).
- `TooltipReference` uses [Box](/docs/box/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `useTooltipState`

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

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

- **`unstable_gutter`** <span title="Experimental">⚠️</span>
  <code>number | undefined</code>

  Offset between the reference and the popover.

- **`unstable_preventOverflow`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Prevents popover from being positioned outside the boundary.

- **`unstable_boundariesElement`** <span title="Experimental">⚠️</span>
  <code>&#34;scrollParent&#34; | &#34;viewport&#34; | &#34;window&#34; | undefined</code>

  Boundaries element used by `preventOverflow`.

### `Tooltip`

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`unstable_animated`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  If `true`, the hidden element attributes will be set in different
timings to enable CSS transitions. This means that you can safely use the `.hidden` selector in the CSS to
create transitions.
  - When it becomes visible, immediatelly remove the `hidden` attribute,
then add the `hidden` class.
  - When it becomes hidden, immediatelly remove the `hidden` class, then
add the `hidden` attribute.

### `TooltipArrow`

- **`placement`**
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.

### `TooltipReference`

- **`unstable_referenceRef`** <span title="Experimental">⚠️</span>
  <code>RefObject&#60;HTMLElement | null&#62;</code>

  The reference element.

- **`show`**
  <code>() =&#62; void</code>

  Changes the `visible` state to `true`

- **`hide`**
  <code>() =&#62; void</code>

  Changes the `visible` state to `false`
