import * as Ariakit from "@ariakit/react";
import * as React from "react";

function MenuWithCombobox() {
  const [value, setValue] = React.useState("");

  // ComboboxProvider wraps MenuProvider so the menu store can access the
  // combobox store from context. This is how the menu-nested-combobox example
  // works.
  return (
    <Ariakit.ComboboxProvider
      resetValueOnHide
      includesBaseElement={false}
      value={value}
      setValue={setValue}
    >
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Open menu</Ariakit.MenuButton>
        <Ariakit.Menu portal overlap unmountOnHide gutter={4}>
          <Ariakit.Combobox
            placeholder="Search top-level menu..."
            autoSelect
            className="combobox"
          />
          <Ariakit.ComboboxList className="combobox-list">
            <Ariakit.ComboboxItem value="apple">Apple</Ariakit.ComboboxItem>
            <Ariakit.ComboboxItem value="banana">Banana</Ariakit.ComboboxItem>
            <Ariakit.ComboboxItem value="cherry">Cherry</Ariakit.ComboboxItem>
          </Ariakit.ComboboxList>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </Ariakit.ComboboxProvider>
  );
}

function MenuWithComboboxSubmenu() {
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
              <Ariakit.Combobox placeholder="Search submenu..." autoSelect />
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

export default function Example() {
  return (
    <>
      <MenuWithCombobox />
      <MenuWithComboboxSubmenu />
    </>
  );
}
