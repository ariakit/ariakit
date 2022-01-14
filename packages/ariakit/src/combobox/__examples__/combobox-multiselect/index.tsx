import { Checkbox, CheckboxCheck, useCheckboxState } from "ariakit/checkbox";
import {
  Combobox,
  ComboboxItem,
  ComboboxPopover,
  useComboboxState,
} from "ariakit/combobox";
import list from "./list";
import "./style.css";

export default function Example() {
  const combobox = useComboboxState({ gutter: 8, list });
  const checkbox = useCheckboxState({ defaultValue: ["Apple"] });
  return (
    <div className="wrapper">
      <label className="label">
        Your favorite food
        <Combobox
          state={combobox}
          placeholder="e.g., Apple, Burger"
          className="combobox"
        />
      </label>
      <ComboboxPopover state={combobox} className="popover">
        {combobox.matches.length ? (
          combobox.matches.map((value) => (
            <ComboboxItem key={value} onClick={() => combobox.setValue("")}>
              {(props) => (
                <Checkbox {...props} as="div" state={checkbox} value={value}>
                  <CheckboxCheck />
                  {value}
                </Checkbox>
              )}
            </ComboboxItem>
          ))
        ) : (
          <div>No results found</div>
        )}
      </ComboboxPopover>
    </div>
  );
}
