import "./style.css";
import * as Ariakit from "@ariakit/react";
import { MenuProvider } from "@ariakit/react-core/menu/menu-provider";

export default function Example() {
  return (
    <MenuProvider>
      <Ariakit.MenuButton className="button">
        Actions
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu gutter={8} className="menu">
        <Ariakit.MenuItem className="menu-item" onClick={() => alert("Edit")}>
          Edit
        </Ariakit.MenuItem>
        <Ariakit.MenuItem className="menu-item">Share</Ariakit.MenuItem>
        <Ariakit.MenuItem className="menu-item" disabled>
          Delete
        </Ariakit.MenuItem>
        <Ariakit.MenuSeparator className="separator" />
        <Ariakit.MenuItem className="menu-item">Report</Ariakit.MenuItem>
      </Ariakit.Menu>
    </MenuProvider>
  );
}
