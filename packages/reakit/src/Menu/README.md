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
  MenuSeparator,
  unstable_MenuItemCheckbox as MenuItemCheckbox,
  unstable_MenuItemDisclosure as MenuItemDisclosure,
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
          <label>
            <MenuItemCheckbox {...menu2} name="accept" /> Accept
          </label>
          <label>
            <MenuItemCheckbox {...menu2} name="fruits" value="apple" /> Apple
          </label>
          <label>
            <MenuItemCheckbox {...menu2} name="fruits" value="orange" /> Orange
          </label>
          <MenuSeparator {...menu2} />
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
  unstable_useStaticMenuState as useStaticMenuState,
  Menu,
  unstable_StaticMenu as StaticMenu,
  MenuDisclosure,
  MenuItem,
  MenuSeparator,
  unstable_MenuItemCheckbox as MenuItemCheckbox,
  unstable_MenuItemDisclosure as MenuItemDisclosure,
  unstable_MenuItemRadio as MenuItemRadio,
  mergeProps
} from "reakit";

function Example() {
  const menuBar = useStaticMenuState({ orientation: "horizontal" });
  const menu1 = useMenuState({ unstable_values: { language: "css" } }, menuBar);
  const menu2 = useMenuState({}, menuBar);
  return (
    <div style={{ margin: 150 }}>
      <StaticMenu aria-label="menu" {...menuBar}>
        <MenuItem {...menuBar}>Abc</MenuItem>
        <MenuItem {...menuBar}>Def</MenuItem>
        <MenuSeparator {...menuBar} />
        <MenuItemDisclosure {...menu1}>Ghi</MenuItemDisclosure>
        <Menu {...menu1}>
          <MenuItem {...menu1}>Jkl</MenuItem>
          <MenuItem {...menu1}>Jkld</MenuItem>
          <MenuItem {...menu1}>Mno</MenuItem>
          <label>
            <MenuItemRadio {...menu1} name="language" value="html" />
            HTML
          </label>
          <label>
            <MenuItemRadio {...menu1} name="language" value="js" />
            JS
          </label>
          <label>
            <MenuItemRadio {...menu1} name="language" value="css" />
            CSS
          </label>
        </Menu>
        <MenuItemDisclosure {...menu2}>Pqr</MenuItemDisclosure>
        <Menu {...menu2}>
          <MenuItem {...menu2}>Stu</MenuItem>
          <MenuItem {...menu2}>Vwx</MenuItem>
          <label>
            <MenuItemCheckbox {...menu2} name="accept" /> Accept
          </label>
          <label>
            <MenuItemCheckbox {...menu2} name="fruits" value="apple" /> Apple
          </label>
          <label>
            <MenuItemCheckbox {...menu2} name="fruits" value="orange" /> Orange
          </label>
        </Menu>
        <MenuItem {...menuBar}>Ded</MenuItem>
      </StaticMenu>
    </div>
  );
}
```
