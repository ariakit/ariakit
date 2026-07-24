import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const combobox = Ariakit.useComboboxStore({ open: true });
  return (
    <Ariakit.ComboboxList store={combobox} className="popover">
      <Ariakit.ComboboxItem
        className="select-item"
        focusOnHover={false}
        hideOnClick={false}
        value="Apple"
      />
      <Ariakit.ComboboxItem
        className="select-item"
        focusOnHover={false}
        hideOnClick={false}
        value="Banana"
      />
      <Ariakit.ComboboxItem
        className="select-item"
        focusOnHover={false}
        hideOnClick={false}
        value="Grape"
        disabled
      />
      <Ariakit.ComboboxItem
        className="select-item"
        focusOnHover={false}
        hideOnClick={false}
        value="Orange"
      />
    </Ariakit.ComboboxList>
  );
}
