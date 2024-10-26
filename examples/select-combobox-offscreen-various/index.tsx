import * as Ariakit from "@ariakit/react";
// import "./theme.css";
import { ComboboxItem } from "@ariakit/react-core/combobox/combobox-item-offscreen";
import { SelectItem } from "@ariakit/react-core/select/select-item-offscreen";
import deburr from "lodash-es/deburr.js";
import groupBy from "lodash-es/groupBy.js";
import kebabCase from "lodash-es/kebabCase.js";
import { matchSorter } from "match-sorter";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { countries } from "./countries.ts";

function getItem(country: string) {
  return {
    id: `item-${kebabCase(country)}`,
    value: country,
  };
}

function groupItems(items: ReturnType<typeof getItem>[]) {
  const groups = groupBy(items, (item) => deburr(item.value?.at(0)));
  return Object.entries(groups).map(([label, items]) => ({
    id: `group-${label.toLowerCase()}`,
    label,
    items,
  }));
}

export default function Example() {
  const [searchValue, setSearchValue] = useState("");
  const ref = useRef(null);

  const matches = useMemo(() => {
    const items = matchSorter(countries, searchValue);
    return items.map(getItem);
  }, [searchValue]);

  const groupMatches = useMemo(() => groupItems(matches), [matches]);

  return (
    <>
      <div className="wrapper ak-rounded-container flex flex-col gap-4">
        <div>
          <Ariakit.ComboboxProvider
            placement="bottom"
            setValue={(value) => {
              startTransition(() => {
                setSearchValue(value);
              });
            }}
          >
            <Ariakit.ComboboxLabel className="block px-3 py-2">
              Country
            </Ariakit.ComboboxLabel>
            <Ariakit.Combobox
              autoSelect
              placeholder="Search..."
              className="ak-combobox h-10 px-3 w-64"
            />
            <Ariakit.ComboboxPopover
              gutter={8}
              unmountOnHide
              className="ak-popup ak-elevation-1 ak-popover w-[--popover-anchor-width] ak-popup-scroll"
            >
              {matches.map((item, index) => (
                <ComboboxItem
                  key={index}
                  value={item.value}
                  focusOnHover
                  blurOnHoverEnd={false}
                  offscreenBehavior="lazy"
                  className="ak-option truncate block [--padding-block:0.5rem] sm:[--padding-block:0.25rem]"
                />
              ))}
            </Ariakit.ComboboxPopover>
          </Ariakit.ComboboxProvider>
        </div>

        <div>
          <Ariakit.SelectProvider
            placement="bottom"
            defaultValue="Select..."
            virtualFocus={false}
          >
            <Ariakit.SelectLabel className="block px-3 py-2">
              Country
            </Ariakit.SelectLabel>
            <Ariakit.Select className="ak-button [--padding-block:0.5rem] h-10 px-3 w-64" />
            <Ariakit.SelectPopover
              gutter={8}
              unmountOnHide
              className="ak-popup ak-elevation-1 ak-popover w-[--popover-anchor-width] ak-popup-scroll"
            >
              {matches.map((item, index) => (
                <SelectItem
                  key={index}
                  value={item.value}
                  focusOnHover
                  blurOnHoverEnd={false}
                  offscreenBehavior="lazy"
                  className="ak-option truncate block [--padding-block:0.5rem] sm:[--padding-block:0.25rem]"
                />
              ))}
            </Ariakit.SelectPopover>
          </Ariakit.SelectProvider>
        </div>

        <div>
          <Ariakit.ComboboxProvider
            placement="bottom"
            setValue={(value) => {
              startTransition(() => {
                setSearchValue(value);
              });
            }}
          >
            <Ariakit.ComboboxLabel className="block px-3 py-2">
              Country
            </Ariakit.ComboboxLabel>
            <Ariakit.Combobox
              autoSelect
              placeholder="Search..."
              className="ak-combobox h-10 px-3 w-64"
            />
            <Ariakit.ComboboxPopover
              gutter={8}
              unmountOnHide
              className="ak-popup ak-elevation-1 ak-popover w-[--popover-anchor-width] overflow-clip"
            >
              <div ref={ref} className="ak-popup-cover ak-popup-scroll min-h-0">
                {groupMatches.map((group, index) => (
                  <Ariakit.ComboboxGroup key={index} className="ak-popup-cover">
                    <Ariakit.ComboboxGroupLabel className="ak-popup-cover ak-popup-sticky-header">
                      {group.label}
                    </Ariakit.ComboboxGroupLabel>
                    <div className="ak-popup-cover">
                      {group.items.map((item, index) => (
                        <ComboboxItem
                          key={index}
                          value={item.value}
                          focusOnHover
                          blurOnHoverEnd={false}
                          offscreenBehavior="lazy"
                          offscreenRoot={ref}
                          className="ak-option truncate block [--padding-block:0.5rem] sm:[--padding-block:0.25rem]"
                        />
                      ))}
                    </div>
                  </Ariakit.ComboboxGroup>
                ))}
              </div>
            </Ariakit.ComboboxPopover>
          </Ariakit.ComboboxProvider>
        </div>
      </div>
    </>
  );
}
