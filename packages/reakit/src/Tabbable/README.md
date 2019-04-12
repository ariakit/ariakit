---
path: /docs/tabbable
---

# Tabbable

## Usage

```jsx
import { Tabbable } from "reakit";

function Example() {
  return (
    <Tabbable as="div" disabled>
      Tabbable
    </Tabbable>
  );
}
```

## Props

<!-- Automatically generated -->

### `Tabbable`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>unstable_focusable</code>&nbsp;⚠️</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. In this case, only `aria-disabled` will be set. |
