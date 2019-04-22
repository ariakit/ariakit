---
path: /docs/hidden
redirect_from:
  - /components/hidden
  - /components/hidden/hiddencontainer
  - /components/hidden/hiddenhide
  - /components/hidden/hiddenshow
  - /components/hidden/hiddentoggle
---

# Hidden

`Hidden` is an abstract component based on the [WAI-ARIA Disclosure Pattern](https://www.w3.org/TR/wai-aria-practices/#disclosure).

## Installation

```sh
npm install reakit
```

Learn more in [Get started](/docs/get-started).

## Usage

```jsx
import { useHiddenState, Hidden, HiddenDisclosure } from "reakit/Hidden";

function Example() {
  const state = useHiddenState({ visible: true });
  return (
    <>
      <HiddenDisclosure {...state}>Toggle</HiddenDisclosure>
      <Hidden {...state}>Hidden</Hidden>
    </>
  );
}
```

## Accessibility

- `HiddenDisclosure` extends the accessibility features of [Button](/docs/button#accessibility).
- `HiddenDisclosure` has a value specified for `aria-controls` that refers to `Hidden`.
- When `Hidden` is visible, `HiddenDisclosure` has `aria-expanded` set to `true`. When `Hidden` is hidden, it is set to `false`.

Learn more in [Accessibility](/docs/accessibility).

## Composition

- `Hidden` uses [Box](/docs/box), and is used by [Dialog](/docs/dialog), [DialogBackdrop](/docs/dialog), [TabPanel](/docs/tab), [Tooltip](/docs/tooltip) and all their derivatives.
- `HiddenDisclosure` uses [Button](/docs/button), and is used by [DialogDisclosure](/docs/dialog).

Learn more in [Composition](/docs/composition#props-hooks).

## Props

<!-- Automatically generated -->

### `useHiddenState`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |

### `Hidden`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |

### `HiddenDisclosure`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. It works similarly to `readOnly` on form elements. In this case, only `aria-disabled` will be set. |
| <strong><code>visible</code>&nbsp;</strong> | <code>boolean</code> | Whether it's visible or not. |
| <strong><code>toggle</code>&nbsp;</strong> | <code>()&nbsp;=&#62;&nbsp;void</code> | Toggles the `visible` state |
