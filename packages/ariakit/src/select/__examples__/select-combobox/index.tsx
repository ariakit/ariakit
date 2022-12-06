import { useMemo } from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  useComboboxStore,
} from "ariakit/combobox/store";
import {
  Select,
  SelectItem,
  SelectLabel,
  SelectPopover,
  useSelectStore,
} from "ariakit/select/store";
import { matchSorter } from "match-sorter";
import list from "./list";
import "./style.css";

export default function Example() {
  const combobox = useComboboxStore({ resetValueOnHide: true });
  const select = useSelectStore({
    combobox,
    defaultValue: "Apple",
    gutter: 4,
    sameWidth: true,
  });

  const value = combobox.useState("value");
  const mounted = select.useState("mounted");

  const matches = useMemo(() => {
    return matchSorter(list, value, {
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
  }, [value]);

  return (
    <div className="wrapper">
      <SelectLabel store={select}>Favorite fruit</SelectLabel>
      <Select store={select} className="select" />
      {mounted && (
        <SelectPopover store={select} composite={false} className="popover">
          <div className="combobox-wrapper">
            <Combobox
              store={combobox}
              autoSelect
              placeholder="Search..."
              className="combobox"
            />
          </div>
          <ComboboxList store={combobox}>
            {matches.map((value, i) => (
              <ComboboxItem
                key={value + i}
                focusOnHover
                className="select-item"
              >
                {(props) => <SelectItem {...props} value={value} />}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </SelectPopover>
      )}
    </div>
  );
}
