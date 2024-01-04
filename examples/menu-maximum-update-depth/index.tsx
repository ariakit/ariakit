import "./style.css";
import * as Ariakit from "@ariakit/react";

function Menu() {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton className="button">Menu</Ariakit.MenuButton>
      <Ariakit.Menu className="menu">
        <Ariakit.MenuItem className="menu-item">A</Ariakit.MenuItem>
        <Ariakit.MenuItem className="menu-item">B</Ariakit.MenuItem>
        <Ariakit.MenuItem className="menu-item">C</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

export default function Example() {
  return Array.from({ length: 60 }, (_, index) => <Menu key={index} />);
}
