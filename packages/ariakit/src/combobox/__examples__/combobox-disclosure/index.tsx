import {
  Combobox,
  ComboboxDisclosure,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import "./style.css";

export default function Example() {
  const combobox = useComboboxState({ sameWidth: true, gutter: 8 });
  return (
    <div>
      <label className="label">
        Your favorite food
        <div className="combobox-wrapper">
          <Combobox
            state={combobox}
            placeholder="e.g., Pizza"
            className="combobox"
          />
          <ComboboxDisclosure
            state={combobox}
            className="button secondary disclosure"
          />
        </div>
      </label>
      <ComboboxPopover state={combobox} className="popover">
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
