import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  useComboboxState,
} from "ariakit/combobox";
import {
  Select,
  SelectItem,
  SelectLabel,
  SelectPopover,
  useSelectState,
} from "ariakit/select";
import list from "./list";
import "./style.css";

export default function Example() {
  const combobox = useComboboxState({ list, gutter: 4, sameWidth: true });
  // value and setValue shouldn't be passed to the select state because the
  // select value and the combobox value are different things.
  const { value, setValue, ...selectProps } = combobox;
  const select = useSelectState({ ...selectProps, defaultValue: "Apple" });

  // Resets combobox value when popover is collapsed
  if (!select.mounted && combobox.value) {
    combobox.setValue("");
  }

  return (
    <div className="wrapper">
      <SelectLabel state={select}>Favorite fruit</SelectLabel>
      <Select state={select} className="select" />
      <SelectPopover state={select} composite={false} className="popover">
        <div className="combobox-wrapper">
          <Combobox
            state={combobox}
            autoSelect
            placeholder="Search..."
            className="combobox"
          />
        </div>
        <ComboboxList state={combobox}>
          {combobox.matches.map((value, i) => (
            <ComboboxItem key={value + i} focusOnHover className="select-item">
              {(props) => <SelectItem {...props} value={value} />}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </SelectPopover>
    </div>
  );
}
