---
path: /docs/toolbar
redirect_from:
  - /components/toolbar
---

# Toolbar

```jsx
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  useToolbarState
} from "reakit";

function Example() {
  const toolbar = useToolbarState();
  return (
    <Toolbar {...toolbar}>
      <ToolbarButton {...toolbar}>Item 1</ToolbarButton>
      <ToolbarButton {...toolbar}>Item 2</ToolbarButton>
      <ToolbarSeparator {...toolbar} />
      <ToolbarButton {...toolbar}>Item 3</ToolbarButton>
    </Toolbar>
  );
}
```
