import * as Ariakit from "@ariakit/react";
import { SelectItem as OffscreenSelectItem } from "@ariakit/react-components/select/select-item-offscreen";
import { SelectRenderer } from "@ariakit/react-components/select/select-renderer";
import type { SelectStoreItem } from "@ariakit/react-components/select/select-store";
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

const fruits: SelectStoreItem[] = [
  { id: "apple", value: "Apple" },
  { id: "banana", value: "Banana" },
  { id: "orange", value: "Orange" },
];

interface FixtureProps {
  label: string;
  renderer?: boolean;
}

function Fixture({ label, renderer }: FixtureProps) {
  const [items, setItems] = useState<SelectStoreItem[]>([]);
  const [value, setValue] = useState("Orange");
  const selectRef = useRef<HTMLButtonElement>(null);
  const select = Ariakit.useSelectStore<string>({
    items,
    setItems,
    value,
    setValue,
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
      <Ariakit.SelectLabel store={select}>{label}</Ariakit.SelectLabel>
      <Ariakit.Select ref={selectRef} store={select}>
        {value}
      </Ariakit.Select>
      <Ariakit.SelectPopover store={select} unmountOnHide={!renderer}>
        {renderer ? (
          <SelectRenderer<SelectStoreItem> store={select} items={items}>
            {({ value, ...item }) => (
              <Ariakit.SelectItem key={item.id} value={value} {...item} />
            )}
          </SelectRenderer>
        ) : (
          items.map((item) => <Ariakit.SelectItem key={item.id} {...item} />)
        )}
      </Ariakit.SelectPopover>
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
      <Ariakit.SelectProvider defaultValue="Brazil">
        <Ariakit.SelectLabel>Country</Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover gutter={4} sameWidth>
          {countries.map((country) => (
            <Ariakit.SelectItem
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
            </Ariakit.SelectItem>
          ))}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
      <button type="button" onClick={() => setUseAliases(true)}>
        Use country aliases
      </button>
      <Ariakit.SelectProvider defaultValue="Brazil">
        <Ariakit.SelectLabel>Virtualized country</Ariakit.SelectLabel>
        <Ariakit.Select />
        <Ariakit.SelectPopover
          gutter={4}
          sameWidth
          style={{ maxHeight: 80, overflow: "auto" }}
        >
          {offscreenCountries.map((country) => (
            <OffscreenSelectItem
              key={country.value}
              offscreenMode="passive"
              typeaheadText={country.value}
              value={country.value}
              style={{ display: "block" }}
            >
              <span aria-hidden>{country.flag}</span> {country.value}
            </OffscreenSelectItem>
          ))}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
      <Fixture label="Fruit" />
      <Fixture label="Rendered fruit" renderer />
    </>
  );
}
