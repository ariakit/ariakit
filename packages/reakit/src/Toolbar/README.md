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
  useToolbarState,
  Button
} from "reakit";

function Example() {
  const toolbar = useToolbarState();
  return (
    <Toolbar orientation="vertical">
      <ToolbarItem {...toolbar}>
        <Button>Item 1</Button>
      </ToolbarItem>
      <ToolbarItem {...toolbar}>
        <Button>Item 2</Button>
      </ToolbarItem>
      <ToolbarSeparator {...toolbar} />
      <ToolbarItem {...toolbar}>
        <Button>Item 3</Button>
      </ToolbarItem>
    </Toolbar>
  );
}
```
