import "./style.css";
import { startTransition, useEffect, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { SelectRenderer } from "@ariakit/react-core/select/select-renderer";
import groupBy from "lodash-es/groupBy.js";
import kebabCase from "lodash-es/kebabCase.js";
import { matchSorter } from "match-sorter";
import { countries } from "./countries.js";

function getItem(country: string) {
  return {
    id: kebabCase(country),
    value: country,
    style: { height: 40 },
  };
}

function groupItems(items: Partial<ReturnType<typeof getItem>>[]) {
  const groups = groupBy(items, (item) => item.value?.at(0));
  return Object.entries(groups).map(([label, items]) => ({
    id: `group-${label}`,
    label,
    items,
    style: { height: items.length * 40 + 36 },
  }));
}

const defaultItems = countries.map(getItem);

export default function Example() {
  const [searchValue, setSearchValue] = useState("");

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
  const [matches, setMatches] = useState(() => groupItems(defaultItems));

  useEffect(() => {
    startTransition(() => {
      const items = matchSorter(countries, searchValue);
      setMatches(groupItems(items.map(getItem)));
    });
  }, [searchValue]);

  return (
    <>
      <div className="wrapper">
        <Ariakit.SelectLabel store={select}>
          Select your country
        </Ariakit.SelectLabel>
        <Ariakit.Select store={select} className="select">
          {selectValue || "Choose a country..."}
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
            <SelectRenderer items={matches} gap={8} paddingEnd={8}>
              {({ items, label, id, ...item }) => (
                <Ariakit.SelectGroup key={id} {...item} className="group">
                  <Ariakit.SelectGroupLabel className="group-label">
                    {label}
                  </Ariakit.SelectGroupLabel>
                  <SelectRenderer id={id} items={items} itemSize={40}>
                    {({ value, ...item }) => (
                      <Ariakit.ComboboxItem
                        key={item.id}
                        {...item}
                        focusOnHover
                        className="select-item"
                        render={<Ariakit.SelectItem value={value} />}
                      >
                        <span className="select-item-value">{value}</span>
                      </Ariakit.ComboboxItem>
                    )}
                  </SelectRenderer>
                </Ariakit.SelectGroup>
              )}
            </SelectRenderer>
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </div>
    </>
  );
}
