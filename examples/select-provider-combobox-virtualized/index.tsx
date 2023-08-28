import "./style.css";
import { startTransition, useMemo, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { ComboboxProvider } from "@ariakit/react-core/combobox/combobox-provider";
import { SelectProvider } from "@ariakit/react-core/select/select-provider";
import { SelectRenderer } from "@ariakit/react-core/select/select-renderer";
import type { SelectRendererItem } from "@ariakit/react-core/select/select-renderer";
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
    } satisfies SelectRendererItem;
  });
}

const defaultItems = countries.map(getItem);

export default function Example() {
  const [selectValue, setSelectValue] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const combobox = Ariakit.useComboboxStore({ defaultItems });

  const matches = useMemo(() => {
    const items = matchSorter(countries, searchValue);
    return groupItems(items.map(getItem));
  }, [searchValue]);

  return (
    <>
      <div className="wrapper">
        <ComboboxProvider
          store={combobox}
          setValue={(value) => startTransition(() => setSearchValue(value))}
          resetValueOnHide
        >
          <SelectProvider
            combobox={combobox}
            defaultItems={defaultItems}
            defaultValue=""
            value={selectValue}
            setValue={setSelectValue}
          >
            <Ariakit.SelectLabel>Country</Ariakit.SelectLabel>
            <Ariakit.Select className="button">
              <span className="select-value">
                {selectValue || "Select a country"}
              </span>
              <Ariakit.SelectArrow />
            </Ariakit.Select>
            <Ariakit.SelectPopover gutter={4} sameWidth className="popover">
              <div className="combobox-wrapper">
                <Ariakit.Combobox
                  autoSelect
                  placeholder="Search..."
                  className="combobox"
                />
              </div>
              <Ariakit.ComboboxList>
                <SelectRenderer items={matches} gap={8} overscan={1}>
                  {({ label, ...item }) => (
                    <SelectRenderer
                      key={item.id}
                      className="group"
                      overscan={1}
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
                      {(item) => (
                        <Ariakit.SelectItem
                          key={item.id}
                          {...item}
                          className="select-item"
                          render={<Ariakit.ComboboxItem />}
                        >
                          <span className="select-item-value">
                            {item.value}
                          </span>
                        </Ariakit.SelectItem>
                      )}
                    </SelectRenderer>
                  )}
                </SelectRenderer>
              </Ariakit.ComboboxList>
            </Ariakit.SelectPopover>
          </SelectProvider>
        </ComboboxProvider>
      </div>
    </>
  );
}
