import * as Ariakit from "@ariakit/react";
import * as React from "react";

// A non-searchable parent menu with a submenu that contains a combobox.
// Clicking the submenu button should NOT close the parent menu.
export default function Example() {
  const [value, setValue] = React.useState("");

  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
      <Ariakit.Menu portal unmountOnHide gutter={4}>
        <Ariakit.MenuItem>Cut</Ariakit.MenuItem>
        <Ariakit.MenuItem>Copy</Ariakit.MenuItem>
        <Ariakit.ComboboxProvider
          resetValueOnHide
          includesBaseElement={false}
          value={value}
          setValue={setValue}
        >
          <Ariakit.MenuProvider>
            <Ariakit.MenuButton render={<Ariakit.MenuItem />}>
              Search items
            </Ariakit.MenuButton>
            <Ariakit.Menu portal overlap unmountOnHide gutter={4}>
              <Ariakit.Combobox placeholder="Search..." autoSelect />
              <Ariakit.ComboboxList>
                <Ariakit.ComboboxItem value="Apple">Apple</Ariakit.ComboboxItem>
                <Ariakit.ComboboxItem value="Banana">
                  Banana
                </Ariakit.ComboboxItem>
                <Ariakit.ComboboxItem value="Cherry">
                  Cherry
                </Ariakit.ComboboxItem>
              </Ariakit.ComboboxList>
            </Ariakit.Menu>
          </Ariakit.MenuProvider>
        </Ariakit.ComboboxProvider>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}
