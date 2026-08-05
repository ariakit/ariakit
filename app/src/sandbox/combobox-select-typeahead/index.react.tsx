import * as Ariakit from "@ariakit/react";
import { ComboboxRenderer } from "@ariakit/react-components/combobox/combobox-renderer";
import type { ComboboxStoreItem } from "@ariakit/react-components/combobox/combobox-store";
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

const fruits = [
  { id: "apple", value: "Apple" },
  { id: "banana", value: "Banana" },
  { id: "orange", value: "Orange" },
] satisfies ComboboxStoreItem[] & SelectStoreItem[];

function getTypeaheadText(value: string, useAliases: boolean) {
  if (value === "Citrus") return "";
  if (useAliases && value === "Canada") return "Dominion";
  return value;
}

interface CountryFixtureProps {
  label: string;
  useAliases: boolean;
}

function ComboboxCountryFixture({ label, useAliases }: CountryFixtureProps) {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Brazil">
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4} sameWidth>
        {countries.map((country) => (
          <Ariakit.ComboboxItem
            key={country.value}
            typeaheadText={getTypeaheadText(country.value, useAliases)}
            value={country.value}
          >
            <span aria-hidden>{country.flag}</span> {country.value}
          </Ariakit.ComboboxItem>
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function SelectCountryFixture({ label, useAliases }: CountryFixtureProps) {
  return (
    <Ariakit.SelectProvider defaultValue="Brazil">
      <Ariakit.SelectLabel>{label}</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover gutter={4} sameWidth>
        {countries.map((country) => (
          <Ariakit.SelectItem
            key={country.value}
            typeaheadText={getTypeaheadText(country.value, useAliases)}
            value={country.value}
          >
            <span aria-hidden>{country.flag}</span> {country.value}
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

interface LateItemsFixtureProps {
  label: string;
  renderer?: boolean;
}

function ComboboxLateItemsFixture({ label, renderer }: LateItemsFixtureProps) {
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

function SelectLateItemsFixture({ label, renderer }: LateItemsFixtureProps) {
  const [items, setItems] = useState<SelectStoreItem[]>([]);
  const [value, setValue] = useState("Orange");
  const selectRef = useRef<HTMLButtonElement>(null);
  const select = Ariakit.useSelectStore({
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
      <ComboboxCountryFixture label="Country" useAliases={useAliases} />
      <button type="button" onClick={() => setUseAliases(true)}>
        Use country aliases
      </button>
      <ComboboxLateItemsFixture label="Fruit" />
      <ComboboxLateItemsFixture label="Rendered fruit" renderer />
      <SelectCountryFixture
        label="Legacy Select country"
        useAliases={useAliases}
      />
      <SelectLateItemsFixture label="Legacy Select fruit" />
      <SelectLateItemsFixture label="Legacy Select rendered fruit" renderer />
    </>
  );
}
