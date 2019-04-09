---
path: /docs/menu
---

# Menu

## Usage

```jsx
import React from "react";
import {
  useMenuState,
  Menu,
  MenuDisclosure,
  MenuItem,
  MenuSeparator,
  MenuItemCheckbox,
  mergeProps
} from "reakit";

const Menu1 = React.forwardRef((props, ref) => {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure {...props} {...menu} ref={ref}>
        Item 3
      </MenuDisclosure>
      <Menu {...menu}>
        <MenuItemCheckbox {...menu} name="accept">
          Accept
        </MenuItemCheckbox>
        <MenuItemCheckbox {...menu} name="fruits" value="apple">
          Apple
        </MenuItemCheckbox>
        <MenuItemCheckbox {...menu} name="fruits" value="orange">
          Orange
        </MenuItemCheckbox>
        <MenuSeparator {...menu} />
        <MenuItem {...menu}>Item 1</MenuItem>
        <MenuItem {...menu}>Item 2</MenuItem>
      </Menu>
    </>
  );
});

function Example() {
  const menu = useMenuState();
  return (
    <div style={{ margin: 150 }}>
      <MenuDisclosure {...menu}>disclosure</MenuDisclosure>
      <Menu aria-label="menu" {...menu}>
        <MenuItem {...menu}>Item 1</MenuItem>
        <MenuItem {...menu}>Item 2</MenuItem>
        <MenuItem {...menu}>{props => <Menu1 {...props} />}</MenuItem>
      </Menu>
    </div>
  );
}
```

```jsx
import React from "react";
import {
  useMenuState,
  Menu,
  MenuDisclosure,
  MenuItem,
  MenuSeparator,
  StaticMenu,
  MenuItemCheckbox,
  MenuItemRadio,
  mergeProps
} from "reakit";

const Menu1 = React.forwardRef((props, ref) => {
  const menu = useMenuState({ unstable_values: { language: "css" } });
  return (
    <>
      <MenuDisclosure {...props} {...menu} ref={ref}>
        Ghi
      </MenuDisclosure>
      <Menu {...menu}>
        <MenuItem {...menu}>Jkl</MenuItem>
        <MenuItem {...menu}>Jkld</MenuItem>
        <MenuItem {...menu}>Mno</MenuItem>
        <MenuItemRadio {...menu} name="language" value="html">
          HTML
        </MenuItemRadio>
        <MenuItemRadio {...menu} name="language" value="js">
          JS
        </MenuItemRadio>
        <MenuItemRadio {...menu} name="language" value="css">
          CSS
        </MenuItemRadio>
      </Menu>
    </>
  );
});

const Menu2 = React.forwardRef((props, ref) => {
  const menu = useMenuState();
  return (
    <>
      <MenuDisclosure {...props} {...menu} ref={ref}>
        Pqr
      </MenuDisclosure>
      <Menu {...menu}>
        <MenuItem {...menu}>Stu</MenuItem>
        <MenuItem {...menu}>Vwx</MenuItem>
        <MenuItem {...menu}>{p => <Menu1 {...p} />}</MenuItem>
        <MenuItemCheckbox {...menu} name="accept">
          Accept
        </MenuItemCheckbox>
        <MenuItemCheckbox {...menu} name="fruits" value="apple">
          Apple
        </MenuItemCheckbox>
        <MenuItemCheckbox {...menu} name="fruits" value="orange">
          Orange
        </MenuItemCheckbox>
      </Menu>
    </>
  );
});

function Example() {
  const menu = useMenuState({ orientation: "horizontal" });
  return (
    <div style={{ margin: 150 }}>
      <StaticMenu aria-label="menu" {...menu}>
        <MenuItem {...menu}>Abc</MenuItem>
        <MenuItem {...menu}>Def</MenuItem>
        <MenuSeparator {...menu} />
        <MenuItem {...menu}>{props => <Menu1 {...props} />}</MenuItem>
        <MenuItem {...menu}>{props => <Menu2 {...props} />}</MenuItem>
        <MenuItem {...menu}>Ded</MenuItem>
      </StaticMenu>
    </div>
  );
}
```
