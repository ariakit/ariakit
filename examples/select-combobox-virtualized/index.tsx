import "./style.css";
import { startTransition, useEffect, useState } from "react";
import * as Ariakit from "@ariakit/react";
import type { CollectionRendererItem } from "@ariakit/react-core/collection/collection-renderer";
import { SelectRenderer } from "@ariakit/react-core/select/select-renderer";
import deburr from "lodash-es/deburr.js";
import groupBy from "lodash-es/groupBy.js";
import kebabCase from "lodash-es/kebabCase.js";
import { matchSorter } from "match-sorter";
import { countries } from "./countries.js";

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
    } satisfies CollectionRendererItem;
  });
}

const defaultItems = countries.map(getItem);

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  const [matches, setMatches] = useState(() => groupItems(defaultItems));

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

  const selectValue = select.useState("value");

  useEffect(() => {
    startTransition(() => {
      const items = matchSorter(countries, searchValue);
      setMatches(groupItems(items.map(getItem)));
    });
  }, [searchValue]);

  return (
    <>
      <div className="wrapper">
        <Ariakit.SelectLabel store={select}>Country</Ariakit.SelectLabel>
        <Ariakit.Select store={select} className="select">
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
            <SelectRenderer items={matches} gap={8}>
              {({ label, ...item }) => (
                <SelectRenderer
                  key={item.id}
                  className="group"
                  {...item}
                  render={(props) => (
                    <Ariakit.SelectGroup {...props}>
                      <Ariakit.SelectGroupLabel className="group-label">
                        {label}
                      </Ariakit.SelectGroupLabel>
                      {props.children}
                    </Ariakit.SelectGroup>
                  )}
                >
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
              )}
            </SelectRenderer>
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </div>
    </>
  );
}
