import * as Ariakit from "@ariakit/react";
import { SelectRenderer } from "@ariakit/react-components/select/select-renderer";
import { startTransition, useEffect, useState } from "react";
import { countries } from "./countries.ts";
import "./style.css";

function getItem(country: string) {
  return {
    id: `item-${country.toLowerCase().replace(/[^a-z]+/g, "-")}`,
    value: country,
  };
}

const defaultItems = countries.map(getItem);

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  const [matches, setMatches] = useState(defaultItems);

  const combobox = Ariakit.useComboboxStore({
    defaultItems,
    resetValueOnHide: true,
    value: searchValue,
    setValue: setSearchValue,
  });
  const select = Ariakit.useSelectStore({
    combobox,
    defaultItems,
    defaultValue: "",
  });

  const selectValue = Ariakit.useStoreState(select, "value");

  useEffect(() => {
    startTransition(() => {
      const query = searchValue.toLowerCase();
      setMatches(
        defaultItems.filter((item) => item.value.toLowerCase().includes(query)),
      );
    });
  }, [searchValue]);

  return (
    <div className="wrapper">
      <Ariakit.SelectLabel store={select}>Country</Ariakit.SelectLabel>
      <Ariakit.Select store={select} className="button">
        <span className="select-value">
          {selectValue || "Select a country"}
        </span>
        <Ariakit.SelectArrow />
      </Ariakit.Select>
      <Ariakit.SelectPopover
        store={select}
        gutter={4}
        sameWidth
        className="popover"
      >
        <div className="combobox-wrapper">
          <Ariakit.Combobox
            store={combobox}
            autoSelect
            placeholder="Search..."
            className="combobox"
          />
        </div>
        <Ariakit.ComboboxList store={combobox}>
          <SelectRenderer store={select} items={matches} itemSize={40}>
            {({ value, ...item }) => (
              <Ariakit.ComboboxItem
                key={item.id}
                {...item}
                className="select-item"
                render={<Ariakit.SelectItem value={value} />}
              >
                <span className="select-item-value">{value}</span>
              </Ariakit.ComboboxItem>
            )}
          </SelectRenderer>
        </Ariakit.ComboboxList>
      </Ariakit.SelectPopover>
    </div>
  );
}
