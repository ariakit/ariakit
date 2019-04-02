---
path: /docs/toolbar
redirect_from:
  - /components/toolbar
---

# Toolbar

```jsx
import {
  Button,
  Menu,
  MenuDisclosure,
  MenuItem,
  useMenuState,
  Group,
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
  useToolbarState
} from "reakit";

function Example() {
  const toolbar = useToolbarState();
  const menu = useMenuState();
  return (
    <Toolbar {...toolbar}>
      <ToolbarItem {...toolbar}>Item 1</ToolbarItem>
      <ToolbarItem {...toolbar}>Item 2</ToolbarItem>
      <ToolbarSeparator {...toolbar} />
      <ToolbarItem {...toolbar}>Item 3</ToolbarItem>
      <Group>
        <ToolbarItem as={Button} {...toolbar}>
          Item 4
        </ToolbarItem>
        <ToolbarItem as={MenuDisclosure} {...menu} {...toolbar}>
          Item 5
        </ToolbarItem>
        <Menu {...menu}>
          <MenuItem {...menu}>Item 1</MenuItem>
          <MenuItem {...menu}>Item 2</MenuItem>
          <MenuItem {...menu}>Item 3</MenuItem>
        </Menu>
      </Group>
      <ToolbarSeparator {...toolbar} />
      <ToolbarItem {...toolbar}>Item 6</ToolbarItem>
    </Toolbar>
  );
}
```

```jsx
import {
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
  useToolbarState
} from "reakit";

function Example() {
  const toolbar = useToolbarState({ orientation: "vertical" });
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
