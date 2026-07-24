import * as Ariakit from "@ariakit/react";
import { ComboboxItem as OffscreenComboboxItem } from "@ariakit/react-components/combobox/combobox-item-offscreen";
import { ComboboxRenderer } from "@ariakit/react-components/combobox/combobox-renderer";
import type { ComboboxStoreItem } from "@ariakit/react-components/combobox/combobox-store";
import { useRef, useState } from "react";

const countries = [
  { value: "Brazil", flag: "🇧🇷" },
  { value: "Citrus", flag: "" },
  { value: "Canada", flag: "🇨🇦" },
  { value: "Japan", flag: "🇯🇵" },
  { value: "Mexico", flag: "🇲🇽" },
];

const offscreenCountries = [
  { value: "Brazil", flag: "🇧🇷" },
  ...Array.from({ length: 25 }, (_, index) => ({
    value: `Item ${index + 1}`,
    flag: "🏳️",
  })),
  { value: "Canada", flag: "🇨🇦" },
];

const fruits: ComboboxStoreItem[] = [
  { id: "apple", value: "Apple" },
  { id: "banana", value: "Banana" },
  { id: "orange", value: "Orange" },
];

interface FixtureProps {
  label: string;
  renderer?: boolean;
}

function Fixture({ label, renderer }: FixtureProps) {
  const [items, setItems] = useState<ComboboxStoreItem[]>([]);
  const [value, setValue] = useState("Orange");
  const selectRef = useRef<HTMLButtonElement>(null);
  const select = Ariakit.useComboboxStore({
    items,
    setItems,
    selectedValue: value,
    setSelectedValue: setValue,
  });
  const activeId = Ariakit.useStoreState(select, "activeId");

  const loadOptions = () => {
    setItems(fruits);
    selectRef.current?.focus();
  };

  return (
    <section>
      <h2>{label}</h2>
      <button type="button" onClick={loadOptions}>
        Load {label.toLowerCase()} options
      </button>
      <Ariakit.ComboboxSelectLabel store={select}>
        {label}
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect ref={selectRef} store={select}>
        {value}
      </Ariakit.ComboboxSelect>
      <Ariakit.ComboboxPopover store={select} unmountOnHide={!renderer}>
        {renderer ? (
          <ComboboxRenderer<ComboboxStoreItem> store={select} items={items}>
            {({ value, ...item }) => (
              <Ariakit.ComboboxItem key={item.id} value={value} {...item} />
            )}
          </ComboboxRenderer>
        ) : (
          items.map((item) => <Ariakit.ComboboxItem key={item.id} {...item} />)
        )}
      </Ariakit.ComboboxPopover>
      <p>
        Active item:{" "}
        <output aria-label={`${label} active item`}>
          {activeId ?? "null"}
        </output>
      </p>
    </section>
  );
}

export default function Example() {
  const [useAliases, setUseAliases] = useState(false);

  return (
    <>
      <Ariakit.ComboboxProvider defaultSelectedValue="Brazil">
        <Ariakit.ComboboxSelectLabel>Country</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover gutter={4} sameWidth>
          {countries.map((country) => (
            <Ariakit.ComboboxItem
              key={country.value}
              typeaheadText={
                country.value === "Citrus"
                  ? ""
                  : useAliases && country.value === "Canada"
                    ? "Dominion"
                    : country.value
              }
              value={country.value}
            >
              <span aria-hidden>{country.flag}</span> {country.value}
            </Ariakit.ComboboxItem>
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <button type="button" onClick={() => setUseAliases(true)}>
        Use country aliases
      </button>
      <Ariakit.ComboboxProvider defaultSelectedValue="Brazil">
        <Ariakit.ComboboxSelectLabel>
          Virtualized country
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover
          gutter={4}
          sameWidth
          style={{ maxHeight: 80, overflow: "auto" }}
        >
          {offscreenCountries.map((country) => (
            <OffscreenComboboxItem
              key={country.value}
              offscreenMode="passive"
              typeaheadText={country.value}
              value={country.value}
              style={{ display: "block" }}
            >
              <span aria-hidden>{country.flag}</span> {country.value}
            </OffscreenComboboxItem>
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <Fixture label="Fruit" />
      <Fixture label="Rendered fruit" renderer />
    </>
  );
}
