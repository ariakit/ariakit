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
