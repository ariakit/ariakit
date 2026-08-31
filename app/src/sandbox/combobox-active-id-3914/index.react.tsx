import * as Ariakit from "@ariakit/react";
import { ComboboxRenderer } from "@ariakit/react-components/combobox/combobox-renderer";
import { matchSorter } from "match-sorter";
import { useMemo, useState } from "react";
import { countries } from "./countries.ts";
import "./style.css";

// Both fixtures stay mounted, and a hidden popover keeps its options in the
// DOM, so the ids must be unique across fixtures. Otherwise one combobox's
// `aria-activedescendant` resolves to an option inside the other one.
function getItemId(prefix: string, country: string) {
  return `${prefix}-${country.toLowerCase().replace(/[^a-z]+/g, "-")}`;
}

const defaultItems = countries.map((country) => ({
  id: getItemId("virtual-item", country),
  value: country,
}));

/**
 * Plain combobox list. Both fixtures control `activeId` so they can render
 * details about the highlighted country next to the list.
 */
function ListCombobox() {
  const [searchValue, setSearchValue] = useState("");
  const [activeId, setActiveId] = useState<string | null | undefined>(null);

  const matches = useMemo(
    () => matchSorter(countries, searchValue),
    [searchValue],
  );

  const activeCountry = matches.find(
    (country) => getItemId("list-item", country) === activeId,
  );

  return (
    <div className="wrapper">
      <Ariakit.ComboboxProvider
        value={searchValue}
        setValue={setSearchValue}
        activeId={activeId}
        setActiveId={setActiveId}
      >
        <Ariakit.ComboboxLabel>Country</Ariakit.ComboboxLabel>
        <Ariakit.Combobox
          autoSelect
          placeholder="e.g., Andorra"
          className="combobox"
        />
        <output aria-label="Active country">{activeCountry ?? "None"}</output>
        <Ariakit.ComboboxPopover gutter={8} sameWidth className="popover">
          {matches.map((country) => (
            <Ariakit.ComboboxItem
              key={country}
              id={getItemId("list-item", country)}
              value={country}
              className="combobox-item"
            />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </div>
  );
}

/**
 * Virtualized select with combobox, matching the composition in the bug report.
 * The virtualizer mounts and unmounts items from its own layout effect, so it
 * exercises a different registration order than the plain list above.
 */
function VirtualizedCombobox() {
  const [searchValue, setSearchValue] = useState("");
  const [activeId, setActiveId] = useState<string | null | undefined>(null);

  const combobox = Ariakit.useComboboxStore({
    defaultItems,
    defaultSelectedValue: "",
    resetValueOnHide: true,
    value: searchValue,
    setValue: setSearchValue,
    activeId,
    setActiveId,
  });
  const selectedValue = Ariakit.useStoreState(combobox, "selectedValue");

  const matches = useMemo(
    () => matchSorter(defaultItems, searchValue, { keys: ["value"] }),
    [searchValue],
  );

  const activeCountry = matches.find((item) => item.id === activeId)?.value;

  return (
    <div className="wrapper">
      <Ariakit.ComboboxSelectLabel store={combobox}>
        Virtualized country
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={combobox} className="button">
        <span className="select-value">
          {selectedValue || "Select a country"}
        </span>
        <Ariakit.ComboboxSelectArrow />
      </Ariakit.ComboboxSelect>
      <output aria-label="Active virtualized country">
        {activeCountry ?? "None"}
      </output>
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
            aria-label="Search virtualized countries"
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
                value={value}
                className="combobox-item"
              />
            )}
          </ComboboxRenderer>
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </div>
  );
}

export default function Example() {
  return (
    <main>
      <ListCombobox />
      <VirtualizedCombobox />
    </main>
  );
}
