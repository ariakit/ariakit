import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

export default function Example() {
  const [open, setOpen] = useState(true);
  return (
    <div className="wrapper">
      <Ariakit.ComboboxProvider
        open={open}
        setOpen={setOpen}
        defaultSelectedValue="Apple"
      >
        <Ariakit.ComboboxSelectLabel className="label">
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect className="button" />
        <Ariakit.ComboboxPopover
          gutter={4}
          sameWidth
          unmountOnHide
          className="popover"
        >
          <Ariakit.ComboboxItem className="select-item" value="Apple" />
          <Ariakit.ComboboxItem className="select-item" value="Banana" />
          <Ariakit.ComboboxItem className="select-item" value="Grape" />
          <Ariakit.ComboboxItem className="select-item" value="Orange" />
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </div>
  );
}
