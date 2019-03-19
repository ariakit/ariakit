---
path: /docs/menu
---

# Menu

## Usage

```jsx
import {
  useMenuState,
  Menu,
  MenuDisclosure,
  MenuItem,
  MenuItemDisclosure,
  mergeProps
} from "reakit";

function Example() {
  const menu = useMenuState();
  const menu2 = useMenuState({}, menu);
  return (
    <div style={{ margin: 150 }}>
      <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
      <Menu aria-label="menu" {...menu}>
        <MenuItem {...menu}>Item 1</MenuItem>
        <MenuItem {...menu}>Item 2</MenuItem>
        <MenuItemDisclosure {...menu2}>Item 3</MenuItemDisclosure>
        <Menu {...menu2}>
          <MenuItem {...menu2}>Item 1</MenuItem>
          <MenuItem {...menu2}>Item 2</MenuItem>
        </Menu>
        <MenuItem {...menu}>Item 4</MenuItem>
      </Menu>
    </div>
  );
}
```

```jsx
import {
  useMenuState,
  useStaticMenuState,
  Menu,
  StaticMenu,
  MenuDisclosure,
  MenuItem,
  MenuItemDisclosure,
  mergeProps
} from "reakit";

function Example() {
  const menuBar = useStaticMenuState({ orientation: "horizontal" });
  const menu1 = useMenuState({}, menuBar);
  const menu2 = useMenuState({}, menuBar);
  return (
    <div style={{ margin: 150 }}>
      <StaticMenu aria-label="menu" {...menuBar}>
        <MenuItem {...menuBar}>Abc</MenuItem>
        <MenuItem {...menuBar}>Def</MenuItem>
        <MenuItemDisclosure {...menu1}>Ghi</MenuItemDisclosure>
        <Menu {...menu1}>
          <MenuItem {...menu1}>Jkl</MenuItem>
          <MenuItem {...menu1}>Mno</MenuItem>
        </Menu>
        <MenuItemDisclosure {...menu2}>Pqr</MenuItemDisclosure>
        <Menu {...menu2}>
          <MenuItem {...menu2}>Stu</MenuItem>
          <MenuItem {...menu2}>Vwx</MenuItem>
        </Menu>
        <MenuItem {...menuBar}>Ded</MenuItem>
      </StaticMenu>
    </div>
  );
}
```
