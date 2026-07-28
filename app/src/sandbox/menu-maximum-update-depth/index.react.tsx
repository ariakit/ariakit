import * as Ariakit from "@ariakit/react";

function Menu() {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton>Menu</Ariakit.MenuButton>
      <Ariakit.Menu>
        <Ariakit.MenuItem>A</Ariakit.MenuItem>
        <Ariakit.MenuItem>B</Ariakit.MenuItem>
        <Ariakit.MenuItem>C</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

export default function Example() {
  return Array.from({ length: 60 }, (_, index) => <Menu key={index} />);
}
