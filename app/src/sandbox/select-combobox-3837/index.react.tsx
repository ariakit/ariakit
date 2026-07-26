import * as Ariakit from "@ariakit/react";
import { ComboboxRenderer } from "@ariakit/react-components/combobox/combobox-renderer";
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
    defaultSelectedValue: "",
    resetValueOnHide: true,
    value: searchValue,
    setValue: setSearchValue,
  });
  const selectedValue = Ariakit.useStoreState(combobox, "selectedValue");

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
      <Ariakit.ComboboxSelectLabel store={combobox}>
        Country
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={combobox} className="button">
        <span className="select-value">
          {selectedValue || "Select a country"}
        </span>
        <Ariakit.ComboboxSelectArrow />
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover
        store={combobox}
        gutter={4}
        sameWidth
        className="popover"
      >
        <div className="combobox-wrapper">
          <Ariakit.ComboboxInput
            store={combobox}
            autoSelect
            aria-label="Search countries"
            placeholder="Search..."
            className="combobox"
          />
        </div>
        <Ariakit.ComboboxList store={combobox}>
          <ComboboxRenderer store={combobox} items={matches} itemSize={40}>
            {({ value, ...item }) => (
              <Ariakit.ComboboxItem
                key={item.id}
                {...item}
                className="select-item"
                value={value}
              >
                <span className="select-item-value">{value}</span>
              </Ariakit.ComboboxItem>
            )}
          </ComboboxRenderer>
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </div>
  );
}
