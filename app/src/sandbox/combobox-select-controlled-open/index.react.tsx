import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(true);
  return (
    <Ariakit.ComboboxProvider
      open={open}
      setOpen={setOpen}
      defaultSelectedValue="Apple"
    >
      <Ariakit.ComboboxSelectLabel>Favorite fruit</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4} sameWidth unmountOnHide>
        <Ariakit.ComboboxItem value="Apple" />
        <Ariakit.ComboboxItem value="Banana" />
        <Ariakit.ComboboxItem value="Grape" />
        <Ariakit.ComboboxItem value="Orange" />
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
