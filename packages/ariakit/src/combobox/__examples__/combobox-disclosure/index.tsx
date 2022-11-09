import {
  Combobox,
  ComboboxDisclosure,
  ComboboxItem,
  ComboboxPopover,
  useComboboxStore,
} from "ariakit/combobox/store";
import "./style.css";

export default function Example() {
  const combobox = useComboboxStore({ gutter: 4, sameWidth: true });
  return (
    <div className="wrapper">
      <label className="label">
        Your favorite food
        <div className="combobox-wrapper">
          <Combobox
            store={combobox}
            placeholder="e.g., Pizza"
            className="combobox"
          />
          <ComboboxDisclosure
            store={combobox}
            className="button secondary disclosure"
          />
        </div>
      </label>
      <ComboboxPopover store={combobox} className="popover">
        <ComboboxItem className="combobox-item" value="Pizza">
          🍕 Pizza
        </ComboboxItem>
        <ComboboxItem className="combobox-item" value="Burger">
          🍔 Burger
        </ComboboxItem>
        <ComboboxItem className="combobox-item" value="Spaghetti">
          🍝 Spaghetti
        </ComboboxItem>
        <ComboboxItem className="combobox-item" value="Sushi">
          🍣 Sushi
        </ComboboxItem>
      </ComboboxPopover>
    </div>
  );
}
