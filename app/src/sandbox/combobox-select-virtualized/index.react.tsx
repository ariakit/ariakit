import * as Ariakit from "@ariakit/react";
import type { ComboboxRendererItem } from "@ariakit/react-components/combobox/combobox-renderer";
import { ComboboxRenderer } from "@ariakit/react-components/combobox/combobox-renderer";
import { startTransition, useEffect, useState } from "react";

const countries = [
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Denmark",
  "Dominica",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Ireland",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kenya",
  "Latvia",
  "Lebanon",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Nepal",
  "Netherlands",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Peru",
  "Poland",
  "Portugal",
  "Romania",
  "Rwanda",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Thailand",
  "Tunisia",
  "Turkey",
  "Uganda",
  "Ukraine",
  "Uruguay",
  "Vietnam",
  "Yemen",
  "Zambia",
] as const;

function getItem(country: string) {
  return {
    id: `country-${country.toLowerCase().replaceAll(" ", "-")}`,
    value: country,
  };
}

function groupItems(items: ReturnType<typeof getItem>[]) {
  const groups = new Map<string, typeof items>();
  for (const item of items) {
    const label = item.value[0] ?? "";
    const group = groups.get(label) ?? [];
    group.push(item);
    groups.set(label, group);
  }
  return Array.from(groups, ([label, groupedItems]) => ({
    id: `group-${label.toLowerCase()}`,
    label,
    itemSize: 40,
    paddingStart: 32,
    items: groupedItems,
  })) satisfies ComboboxRendererItem[];
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
      const query = searchValue.toLowerCase();
      const filteredItems = defaultItems.filter((item) =>
        item.value.toLowerCase().includes(query),
      );
      setMatches(groupItems(filteredItems));
    });
  }, [searchValue]);

  return (
    <div className="flex w-64 flex-col gap-2">
      <Ariakit.ComboboxSelectLabel store={combobox}>
        Country
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={combobox}>
        <span className="truncate">{selectedValue || "Select a country"}</span>
        <Ariakit.ComboboxSelectArrow />
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover
        store={combobox}
        gutter={4}
        sameWidth
        style={{ maxHeight: 240, overflow: "auto" }}
      >
        <div className="sticky top-0 z-20 bg-white p-2 dark:bg-gray-700">
          <Ariakit.ComboboxInput
            store={combobox}
            autoSelect
            aria-label="Search countries"
            placeholder="Search..."
          />
        </div>
        <Ariakit.ComboboxList store={combobox}>
          <ComboboxRenderer
            store={combobox}
            items={matches}
            gap={8}
            overscan={1}
          >
            {({ label, ...group }) => (
              <ComboboxRenderer
                key={group.id}
                {...group}
                overscan={1}
                render={(props) => (
                  <Ariakit.ComboboxGroup {...props}>
                    <Ariakit.ComboboxGroupLabel className="sticky top-10 z-10 bg-white p-2 dark:bg-gray-700">
                      {label}
                    </Ariakit.ComboboxGroupLabel>
                    {props.children}
                  </Ariakit.ComboboxGroup>
                )}
              >
                {({ value, ...item }) => (
                  <Ariakit.ComboboxItem key={item.id} {...item} value={value} />
                )}
              </ComboboxRenderer>
            )}
          </ComboboxRenderer>
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </div>
  );
}
