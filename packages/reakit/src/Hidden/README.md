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

`Hidden` is a highly generic yet powerful Reakit component. It simply hides itself away and waits for a `visible` prop to show up.

## Usage

```jsx
import { Hidden } from "reakit";

function Example() {
  return <Hidden visible>Hidden</Hidden>;
}
```

```jsx
import { HiddenDisclosure, Hidden, useHiddenState } from "reakit";

function Example() {
  const state = useHiddenState({ visible: true });
  return (
    <div>
      <HiddenDisclosure {...state} disabled focusable>
        Toggle
      </HiddenDisclosure>
      <Hidden {...state}>Hidden</Hidden>
    </div>
  );
}

return <Example />;
```

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
