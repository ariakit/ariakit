---
path: /docs/tooltip
redirect_from:
  - /components/tooltip
---

# Tooltip

`Tooltip` follows the [WAI-ARIA Tooltip Pattern](https://www.w3.org/TR/wai-aria-practices/#tooltip). It's a popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started).

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

## Accessibility

- `Tooltip` has role `tooltip`.
- `TooltipReference` has `aria-describedby` referring to `Tooltip`.

Learn more in [Accessibility](/docs/accessibility).

## Composition

- `Tooltip` uses [Hidden](/docs/hidden).
- `TooltipArrow` uses [PopoverArrow](/docs/popover).
- `TooltipReference` uses [Box](/docs/box).

Learn more in [Composition](/docs/composition#props-hooks).

## Props

<!-- Automatically generated -->

### `useTooltipState`

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

- **`placement`**
  <code title="&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start&#34; | &#34;top&#34; | &#34;top-end&#34; | &#34;right-start&#34; | &#34;right&#34; | &#34;right-end&#34; | &#34;bottom-end&#34; | &#34;bottom&#34; | &#34;bottom-start&#34; | &#34;left-end&#34; | &#34;left&#34; | &#34;left-start&#34;">&#34;auto-start&#34; | &#34;auto&#34; | &#34;auto-end&#34; | &#34;top-start...</code>

  Actual `placement`.

- **`unstable_flip`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Whether or not flip the popover.

- **`unstable_shift`** <span title="Experimental">⚠️</span>
  <code>boolean | undefined</code>

  Whether or not shift the popover.

- **`unstable_gutter`** <span title="Experimental">⚠️</span>
  <code>number | undefined</code>

  Offset between the reference and the popover.

### `Tooltip`

- **`visible`**
  <code>boolean</code>

  Whether it's visible or not.

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
