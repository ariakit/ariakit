import "./style.css";
import React from "react";
import * as Ariakit from "@ariakit/react";

// TODO: This is a temporary example. Replace this with a Listbox component.
export default function Example() {
  const select = Ariakit.useSelectStore({ open: true });
  return (
    <Ariakit.SelectList store={select} className="popover">
      <Ariakit.SelectItem
        className="select-item"
        focusOnHover={false}
        value="Apple"
      />
      <Ariakit.SelectItem
        className="select-item"
        focusOnHover={false}
        value="Banana"
      />
      <Ariakit.SelectItem
        className="select-item"
        focusOnHover={false}
        value="Grape"
        disabled
      />
      <Ariakit.SelectItem
        className="select-item"
        focusOnHover={false}
        value="Orange"
      />
    </Ariakit.SelectList>
  );
}
