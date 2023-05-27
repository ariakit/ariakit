import "./style.css";
import { useState } from "react";
import { Menu, MenuItemCheckbox } from "./menu.jsx";

export default function Example() {
  const [values, setValues] = useState({ watching: ["issues"] });
  return (
    <Menu
      label={values.watching.length ? "Unwatch" : "Watch"}
      values={values}
      onValuesChange={(v: typeof values) => setValues(v)}
    >
      <MenuItemCheckbox name="watching" value="issues">
        Issues
      </MenuItemCheckbox>
      <MenuItemCheckbox name="watching" value="pull-requests">
        Pull requests
      </MenuItemCheckbox>
      <MenuItemCheckbox name="watching" value="releases">
        Releases
      </MenuItemCheckbox>
      <MenuItemCheckbox name="watching" value="discussions">
        Discussions
      </MenuItemCheckbox>
      <MenuItemCheckbox name="watching" value="security-alerts">
        Security alerts
      </MenuItemCheckbox>
    </Menu>
  );
}
