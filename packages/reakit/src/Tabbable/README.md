---
path: /docs/tabbable/
---

# Tabbable

`Tabbable` is an abstract component that implements all the interactions an interactive element needs to be fully accessible when it's not rendered as its respective native element.

<carbon-ad></carbon-ad>

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started/).

## Usage

<!-- eslint-disable no-alert -->

```jsx
import { Tabbable } from "reakit/Tabbable";

function Example() {
  const onClick = () => alert("clicked");
  return (
    <>
      <Tabbable as="div" onClick={onClick}>
        Tabbable
      </Tabbable>
      <Tabbable as="div" onClick={onClick} disabled>
        Disabled
      </Tabbable>
      <Tabbable as="div" onClick={onClick} disabled focusable>
        Focusable
      </Tabbable>
    </>
  );
}
```

## Accessibility

- `Tabbable` has `tabindex` set to `0` by default. If it's `disabled` and not `focusable`, the `tabindex` attribute is removed.
- `Tabbable` has `aria-disabled` set to `true` when the `disabled` prop is passed in.
- Pressing <kbd>Enter</kbd> or <kbd>Space</kbd> triggers a click event on `Tabbable` regardless of its rendered element.
- `click`, `mouseDown` and `mouseOver` events aren't triggered when the `disabled` prop is passed in.
- Focus is automatically set on `Tabbable` when it's clicked, which prevents inconsistencies between browsers.

Learn more in [Accessibility](/docs/accessibility/).

## Composition

- `Tabbable` uses [Box](/docs/box/), and is used by [Button](/docs/button/), [Checkbox](/docs/checkbox/), [FormInput](/docs/form/) and [Rover](/docs/rover/).

Learn more in [Composition](/docs/composition/#props-hooks).

## Props

<!-- Automatically generated -->

### `Tabbable`

- **`disabled`**
  <code>boolean | undefined</code>

  Same as the HTML attribute.

- **`focusable`**
  <code>boolean | undefined</code>

  When an element is `disabled`, it may still be `focusable`. It works
similarly to `readOnly` on form elements. In this case, only
`aria-disabled` will be set.
