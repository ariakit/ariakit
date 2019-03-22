---
path: /docs/toolbar
redirect_from:
  - /components/toolbar
---

# Toolbar

```jsx
import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
  useToolbarState
} from "reakit";

function Example() {
  const toolbar = useToolbarState();
  return (
    <Toolbar {...toolbar}>
      <ToolbarItem {...toolbar}>Item 1</ToolbarItem>
      <ToolbarItem {...toolbar}>Item 2</ToolbarItem>
      <ToolbarSeparator {...toolbar} />
      <ToolbarItem {...toolbar}>Item 3</ToolbarItem>
    </Toolbar>
  );
}
```
