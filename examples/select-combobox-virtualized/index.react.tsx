import * as Ariakit from "@ariakit/react";
import type { ComboboxRendererItem } from "@ariakit/react-components/combobox/combobox-renderer";
import { ComboboxRenderer } from "@ariakit/react-components/combobox/combobox-renderer";
import deburr from "lodash-es/deburr.js";
import groupBy from "lodash-es/groupBy.js";
import kebabCase from "lodash-es/kebabCase.js";
import { matchSorter } from "match-sorter";
import { startTransition, useEffect, useState } from "react";
import { countries } from "./countries.ts";
import "./style.css";

function getItem(country: string) {
  return {
    id: `item-${kebabCase(country)}`,
    value: country,
    children: country,
  };
}

function groupItems(items: ReturnType<typeof getItem>[]) {
  const groups = groupBy(items, (item) => deburr(item.value?.at(0)));
  return Object.entries(groups).map(([label, items]) => {
    return {
      id: `group-${label.toLowerCase()}`,
      label,
      itemSize: 40,
      paddingStart: 44,
      items,
    } satisfies ComboboxRendererItem;
  });
}

const defaultItems = countries.map(getItem);

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  const [matches, setMatches] = useState(() => groupItems(defaultItems));

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
      const items = matchSorter(countries, searchValue);
      setMatches(groupItems(items.map(getItem)));
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
            placeholder="Search..."
            className="combobox"
          />
        </div>
        <Ariakit.ComboboxList store={combobox}>
          <ComboboxRenderer
            store={combobox}
            items={matches}
            gap={8}
            overscan={1}
          >
            {({ label, ...item }) => (
              <ComboboxRenderer
                key={item.id}
                className="group"
                overscan={1}
                {...item}
                render={(props) => (
                  <Ariakit.ComboboxGroup {...props}>
                    <Ariakit.ComboboxGroupLabel className="group-label">
                      {label}
                    </Ariakit.ComboboxGroupLabel>
                    {props.children}
                  </Ariakit.ComboboxGroup>
                )}
              >
                {({ value, ...item }) => (
                  <Ariakit.ComboboxItem
                    key={item.id}
                    {...item}
                    value={value}
                    className="select-item"
                  >
                    <span className="select-item-value">{value}</span>
                  </Ariakit.ComboboxItem>
                )}
              </ComboboxRenderer>
            )}
          </ComboboxRenderer>
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </div>
  );
}
