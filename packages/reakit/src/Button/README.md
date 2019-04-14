---
path: /docs/button
redirect_from:
  - /components/button
---

# Button

## Usage

```jsx
import { Button } from "reakit";

function Example() {
  return (
    <>
      <Button>Button</Button>
      <Button unstable_system={{ palette: "foo" }}>Button</Button>
      <Button unstable_system={{ palette: "primary" }}>Button</Button>
      <Button unstable_system={{ palette: "light" }}>Button</Button>
      <Button unstable_system={{ palette: "dark" }}>Button</Button>
      <Button unstable_system={{ palette: "secondary" }}>Button</Button>
      <Button unstable_system={{ palette: "success" }}>Button</Button>
      <Button unstable_system={{ palette: "info" }}>Button</Button>
      <Button unstable_system={{ palette: "info", fill: "outline" }}>
        Button
      </Button>
      <Button unstable_system={{ palette: "warning" }}>Button</Button>
      <Button unstable_system={{ palette: "danger" }}>Button</Button>
    </>
  );
}
```

## Props

<!-- Automatically generated -->

### `Button`

| Name | Type | Description |
|------|------|-------------|
| <strong><code>disabled</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | Same as the HTML attribute. |
| <strong><code>focusable</code>&nbsp;</strong> | <code>boolean&nbsp;&#124;&nbsp;undefined</code> | When an element is `disabled`, it may still be `focusable`. It works similarly to `readOnly` on form elements. In this case, only `aria-disabled` will be set. |
