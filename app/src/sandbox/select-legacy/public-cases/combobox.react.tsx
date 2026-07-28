import * as Ariakit from "@ariakit/react";
import { ComboboxItem as OffscreenComboboxItem } from "@ariakit/react-components/combobox/combobox-item-offscreen";
import { SelectItem as OffscreenSelectItem } from "@ariakit/react-components/select/select-item-offscreen";
import { SelectRenderer } from "@ariakit/react-components/select/select-renderer";
import { startTransition, useMemo, useRef, useState } from "react";

const searchableFoods = [
  "Apple",
  "Banana",
  "Cake",
  "Cherry",
  "Chocolate",
  "Fish",
  "Grape",
  "Green apple",
  "Onion",
  "Pasta",
] as const;

function getMatches(value: string, items: readonly string[] = searchableFoods) {
  const query = value.toLowerCase();
  return items.filter((item) => item.toLowerCase().includes(query));
}

interface SearchableItemsProps {
  matches: readonly string[];
}

function SearchableItems({ matches }: SearchableItemsProps) {
  return (
    <>
      {matches.map((value) => (
        <Ariakit.SelectItem
          key={value}
          value={value}
          render={<Ariakit.ComboboxItem focusOnHover />}
        />
      ))}
    </>
  );
}

export function LegacyPublicSelectComboboxCase() {
  const [searchValue, setSearchValue] = useState("");
  const matches = useMemo(() => getMatches(searchValue), [searchValue]);
  return (
    <Ariakit.ComboboxProvider
      resetValueOnHide
      setValue={(value) => {
        startTransition(() => setSearchValue(value));
      }}
    >
      <Ariakit.SelectProvider defaultValue="Apple">
        <Ariakit.SelectLabel>
          Provider searchable favorite fruit
        </Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover gutter={4} sameWidth>
          <Ariakit.Combobox autoSelect placeholder="Search provider foods" />
          <Ariakit.ComboboxList>
            <SearchableItems matches={matches} />
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  );
}

export function LegacyPublicSelectComboboxStoreCase() {
  const combobox = Ariakit.useComboboxStore({ resetValueOnHide: true });
  const select = Ariakit.useSelectStore({
    combobox,
    defaultValue: "Apple",
  });
  const searchValue = Ariakit.useStoreState(combobox, "value");
  const matches = useMemo(() => getMatches(searchValue), [searchValue]);
  return (
    <>
      <Ariakit.SelectLabel store={select}>
        Store searchable favorite fruit
      </Ariakit.SelectLabel>
      <Ariakit.Select store={select} />
      <Ariakit.SelectPopover store={select} gutter={4} sameWidth>
        <Ariakit.Combobox
          store={combobox}
          autoSelect
          placeholder="Search store foods"
        />
        <Ariakit.ComboboxList store={combobox}>
          {matches.map((value) => (
            <Ariakit.ComboboxItem
              key={value}
              focusOnHover
              render={<Ariakit.SelectItem store={select} value={value} />}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.SelectPopover>
    </>
  );
}

const countries = [
  "Argentina",
  "Australia",
  "Austria",
  "Belgium",
  "Brazil",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Denmark",
  "Dominica",
  "Ecuador",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "India",
  "Indonesia",
  "Ireland",
  "Italy",
  "Jamaica",
  "Japan",
  "Mexico",
  "Morocco",
  "Netherlands",
  "Norway",
  "Peru",
  "Poland",
  "Portugal",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "United Kingdom",
  "United States",
] as const;

const countryItems = countries.map((value) => ({
  id: `legacy-public-country-${value.toLowerCase().replaceAll(" ", "-")}`,
  value,
}));

export function LegacyPublicSelectComboboxVirtualizedCase() {
  const [searchValue, setSearchValue] = useState("");
  const combobox = Ariakit.useComboboxStore({
    defaultItems: countryItems,
    resetValueOnHide: true,
    value: searchValue,
    setValue: setSearchValue,
  });
  const select = Ariakit.useSelectStore({
    combobox,
    defaultItems: countryItems,
    defaultValue: "",
  });
  const matches = useMemo(() => {
    return countryItems.filter((item) =>
      item.value.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [searchValue]);
  const selectValue = Ariakit.useStoreState(select, "value");
  return (
    <>
      <Ariakit.SelectLabel store={select}>
        Virtualized legacy country
      </Ariakit.SelectLabel>
      <Ariakit.Select store={select}>
        {selectValue || "Select a country"}
      </Ariakit.Select>
      <Ariakit.SelectPopover store={select} gutter={4} sameWidth>
        <Ariakit.Combobox
          store={combobox}
          autoSelect
          placeholder="Search virtual countries"
        />
        <Ariakit.ComboboxList store={combobox} style={{ maxHeight: 120 }}>
          <SelectRenderer store={select} items={matches} itemSize={32}>
            {({ value, ...item }) => (
              <Ariakit.ComboboxItem
                key={item.id}
                {...item}
                render={<Ariakit.SelectItem value={value} />}
              >
                {value}
              </Ariakit.ComboboxItem>
            )}
          </SelectRenderer>
        </Ariakit.ComboboxList>
      </Ariakit.SelectPopover>
    </>
  );
}

const branches = ["main", "0.10-stable", "fabric-focus-blur", "gh-pages"];
const tags = ["v18.2.0", "v18.1.0", "v18.0.0"];

interface TabbedSelectProps {
  label: string;
  manual?: boolean;
}

function TabbedSelect({ label, manual }: TabbedSelectProps) {
  const [searchValue, setSearchValue] = useState("");
  const [tab, setTab] = useState<"branches" | "tags">("branches");
  const values = tab === "branches" ? branches : tags;
  const matches = getMatches(searchValue, values);
  return (
    <Ariakit.ComboboxProvider
      resetValueOnHide
      setValue={(value) => {
        startTransition(() => setSearchValue(value));
      }}
    >
      <Ariakit.SelectProvider virtualFocus defaultValue="main">
        <Ariakit.SelectLabel>{label}</Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover gutter={4} unmountOnHide>
          <Ariakit.Combobox autoSelect placeholder="Find a branch or tag" />
          <Ariakit.TabProvider
            selectedId={tab}
            setSelectedId={(id) => {
              if (id === "branches" || id === "tags") setTab(id);
            }}
            selectOnMove={!manual}
          >
            <Ariakit.TabList>
              <Ariakit.Tab id="branches">Branches</Ariakit.Tab>
              <Ariakit.Tab id="tags">Tags</Ariakit.Tab>
            </Ariakit.TabList>
            <Ariakit.TabPanel tabId={tab}>
              <Ariakit.ComboboxList>
                {matches.map((value) => (
                  <Ariakit.SelectItem
                    key={value}
                    value={value}
                    render={<Ariakit.ComboboxItem />}
                  />
                ))}
              </Ariakit.ComboboxList>
            </Ariakit.TabPanel>
          </Ariakit.TabProvider>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  );
}

export function LegacyPublicSelectComboboxTabCase() {
  return <TabbedSelect label="Legacy select with combobox and tab" />;
}

export function LegacyPublicSelectComboboxTabManualCase() {
  return (
    <TabbedSelect label="Legacy select with combobox and manual tab" manual />
  );
}

export function LegacyPublicSelectComboboxFocusWithinCase() {
  const combobox = Ariakit.useComboboxStore({ resetValueOnHide: true });
  const select = Ariakit.useSelectStore({
    combobox,
    defaultValue: "Apple",
  });
  const [popoverFocused, setPopoverFocused] = useState(false);
  const searchValue = Ariakit.useStoreState(combobox, "value");
  const matches = getMatches(searchValue);
  const showCancel = popoverFocused || searchValue !== "";
  return (
    <div role="group" className={popoverFocused ? "focus-within" : undefined}>
      <Ariakit.SelectLabel store={select}>
        Focus-within favorite fruit
      </Ariakit.SelectLabel>
      <Ariakit.Select store={select} />
      <Ariakit.SelectPopover
        store={select}
        portal
        gutter={4}
        sameWidth
        onFocus={() => setPopoverFocused(true)}
        onBlur={() => setPopoverFocused(false)}
      >
        <Ariakit.Combobox
          store={combobox}
          autoSelect
          placeholder="Search focus-within foods"
        />
        <Ariakit.ComboboxCancel
          store={combobox}
          data-visible={showCancel ? "" : undefined}
        />
        <Ariakit.ComboboxList store={combobox}>
          {matches.map((value) => (
            <Ariakit.ComboboxItem
              key={value}
              focusOnHover
              render={<Ariakit.SelectItem store={select} value={value} />}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.SelectPopover>
    </div>
  );
}

export function LegacyPublicSelectComboboxOffscreenCase() {
  const listRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const matches = getMatches(searchValue, countries);
  return (
    <Ariakit.ComboboxProvider
      placement="bottom"
      resetValueOnHide
      setValue={setSearchValue}
    >
      <Ariakit.SelectProvider placement="bottom" defaultValue="Dominica">
        <Ariakit.SelectLabel>
          Offscreen searchable legacy country
        </Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover gutter={8}>
          <Ariakit.Combobox
            autoSelect
            placeholder="Search offscreen countries"
          />
          <Ariakit.ComboboxList
            ref={listRef}
            style={{ maxHeight: 96, overflow: "auto" }}
          >
            {matches.map((value, index) => (
              <OffscreenSelectItem
                key={value}
                value={value}
                offscreenRoot={listRef}
                offscreenMode={index === 0 ? "active" : "passive"}
                render={(props) => {
                  if ("data-offscreen" in props) {
                    return <div {...props} />;
                  }
                  return (
                    <OffscreenComboboxItem
                      {...props}
                      value={value}
                      setValueOnClick={false}
                    />
                  );
                }}
              />
            ))}
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  );
}
