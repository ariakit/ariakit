---
path: /docs/button/
redirect_from:
  - /components/button/
---

# Button

Accessible `Button` component that enables users to trigger an action or event, such as submitting a [Form](/docs/form/), opening a [Dialog](/docs/dialog/), canceling an action, or performing a delete operation. It follows the [WAI-ARIA Button Pattern](https://www.w3.org/TR/wai-aria-practices/#button).

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

```jsx
import { Button } from "reakit/Button";

function Example() {
  return <Button>Button</Button>;
}
```

## Styling

### CSS in JS

- The example below uses [Emotion](https://emotion.sh/docs/introduction) and demonstrates how CSS in JS can be used to style Reakit components. These styles can be reproduced using static CSS, other CSS in JS libraries, or Styled-Components.

```jsx unstyled
import { Button } from "reakit/Button";
import { css } from "emotion";

const className = css`
  color: #ffffff;
  background: #006dff;
  padding: 0.375em 0.75em;
  line-height: 1.5;
  border: transparent;
  cursor: pointer;
  font-size: 16px;
  border-radius: 2.5px;
  &[aria-disabled="true"] {
    cursor: auto;
  }
  &:not([aria-disabled="true"]) {
    &:hover {
      color: #ffffff;
      border-color: #0057cc;
      background-color: #0062e6;
    }
    &:active,
    &[aria-expanded="true"] {
      color: #ffffff;
      border-color: #0058cf;
      background-color: #004eb8;
    }
  }
`;

function Example() {
  return <Button className={className}>Button</Button>;
}
```

Learn more in [Styling](/docs/styling/).

## Accessibility

- `Button` has role `button`.
- When `Button` has focus, <kbd>Space</kbd> and <kbd>Enter</kbd> activates it.

  <!-- eslint-disable no-alert -->

  ```jsx
  import { Button } from "reakit/Button";

  function Example() {
    return (
      <Button as="div" onClick={() => alert("clicked")}>
        Button
      </Button>
    );
  }
  ```

- If `disabled` prop is `true`, `Button` has `disabled` and `aria-disabled` attributes set to `true`.

  <!-- eslint-disable no-alert -->

  ```jsx
  import { Button } from "reakit/Button";

  function Example() {
    return (
      <Button disabled onClick={() => alert("clicked")}>
        Button
      </Button>
    );
  }
  ```

- If `disabled` and `focusable` props are `true`, `Button` has `aria-disabled` attribute set to `true`, but not `disabled`.

  <!-- eslint-disable no-alert -->

  ```jsx
  import { Button } from "reakit/Button";

  function Example() {
    return (
      <Button disabled focusable onClick={() => alert("clicked")}>
        Button
      </Button>
    );
  }
  ```

  This is useful when the presence of a `Button` is important enough so users can perceive it by tabbing.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Button` uses [Tabbable](/docs/tabbable/), and is used by [FormPushButton](/docs/form/), [FormRemoveButton](/docs/form/), [Disclosure](/docs/disclosure/) and all their derivatives.

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `Button`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
  similarly to `readOnly` on form elements. In this case, only
  `aria-disabled` will be set.
