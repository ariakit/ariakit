import * as Ariakit from "@ariakit/react";
import "./style.css";

// TODO: This is a temporary example. Replace this with a Listbox component.
export default function Example() {
  const select = Ariakit.useSelectStore({ open: true });
  return (
    <Ariakit.SelectList store={select} className="popover">
      <Ariakit.SelectItem
        className="select-item"
        focusOnHover={false}
        hideOnClick={false}
        value="Apple"
      />
      <Ariakit.SelectItem
        className="select-item"
        focusOnHover={false}
        hideOnClick={false}
        value="Banana"
      />
      <Ariakit.SelectItem
        className="select-item"
        focusOnHover={false}
        hideOnClick={false}
        value="Grape"
        disabled
      />
      <Ariakit.SelectItem
        className="select-item"
        focusOnHover={false}
        hideOnClick={false}
        value="Orange"
      />
    </Ariakit.SelectList>
  );
}
