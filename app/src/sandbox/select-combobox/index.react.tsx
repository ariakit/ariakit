import * as Ariakit from "@ariakit/react";
import { startTransition, useMemo, useState } from "react";

const foods = [
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
  "Watermelon",
] as const;

function getMatches(value: string) {
  const query = value.toLowerCase();
  return foods.filter((item) => item.toLowerCase().includes(query));
}

function ProviderSelect() {
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
        <Ariakit.SelectPopover
          aria-label="Provider searchable favorite fruit"
          gutter={4}
          sameWidth
          className="max-h-40 overflow-auto"
        >
          <Ariakit.Combobox autoSelect placeholder="Search provider foods" />
          <Ariakit.ComboboxList>
            {matches.map((value) => (
              <Ariakit.SelectItem
                key={value}
                value={value}
                render={<Ariakit.ComboboxItem focusOnHover />}
              />
            ))}
          </Ariakit.ComboboxList>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </Ariakit.ComboboxProvider>
  );
}

function StoreSelect() {
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
      <Ariakit.SelectPopover
        store={select}
        aria-label="Store searchable favorite fruit"
        gutter={4}
        sameWidth
      >
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

export default function Example() {
  return (
    <main className="grid gap-8">
      <ProviderSelect />
      <StoreSelect />
    </main>
  );
}
