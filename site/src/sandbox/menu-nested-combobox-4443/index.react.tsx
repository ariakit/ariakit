import * as Ariakit from "@ariakit/react";
import * as React from "react";

export default function Example() {
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
        {/* TODO: Remove aria-haspopup workaround once
            https://github.com/ariakit/ariakit/issues/4443 is fixed */}
        <Ariakit.MenuButton aria-haspopup="dialog">
          Open menu
        </Ariakit.MenuButton>
        <Ariakit.Menu portal overlap unmountOnHide gutter={4}>
          <Ariakit.Combobox
            placeholder="Search..."
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
