import * as Ariakit from "@ariakit/react";
import { matchSorter } from "match-sorter";
import { startTransition, useDeferredValue, useMemo, useState } from "react";

const fruits = [
  "Apple",
  "Bacon",
  "Banana",
  "Broccoli",
  "Burger",
  "Cake",
  "Candy",
  "Carrot",
  "Cherry",
  "Chocolate",
  "Cookie",
  "Cucumber",
  "Donut",
  "Fish",
  "Fries",
  "Grape",
  "Green apple",
  "Hot dog",
  "Ice cream",
  "Kiwi",
  "Lemon",
  "Lollipop",
  "Onion",
  "Orange",
  "Pasta",
  "Pineapple",
  "Pizza",
  "Potato",
  "Salad",
  "Sandwich",
  "Steak",
  "Strawberry",
  "Tomato",
  "Watermelon",
];

function getMatches(value: string) {
  return matchSorter(fruits, value, {
    baseSort: (firstItem, secondItem) =>
      firstItem.index < secondItem.index ? -1 : 1,
  });
}

interface SearchableSelectProps {
  label: string;
  matches: string[];
  searchLabel: string;
  store?: Ariakit.ComboboxStore;
}

function SearchableSelect({
  label,
  matches,
  searchLabel,
  store,
}: SearchableSelectProps) {
  return (
    <div>
      <Ariakit.ComboboxSelectLabel store={store}>
        {label}
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={store} />
      <Ariakit.ComboboxPopover
        store={store}
        aria-label={label}
        gutter={4}
        sameWidth
        className="max-h-60 overflow-auto"
      >
        <Ariakit.ComboboxInput
          store={store}
          autoSelect
          aria-label={searchLabel}
          placeholder="Search..."
        />
        <Ariakit.ComboboxList store={store}>
          {matches.map((value) => (
            <Ariakit.ComboboxItem
              key={value}
              store={store}
              focusOnHover
              value={value}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </div>
  );
}

function ProviderSelect() {
  const [searchValue, setSearchValue] = useState("");
  const matches = useMemo(() => getMatches(searchValue), [searchValue]);
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Apple"
      resetValueOnHide
      setValue={(value) => {
        startTransition(() => {
          setSearchValue(value);
        });
      }}
    >
      <SearchableSelect
        label="Provider favorite fruit"
        matches={matches}
        searchLabel="Search provider fruits"
      />
    </Ariakit.ComboboxProvider>
  );
}

function StoreSelect() {
  const store = Ariakit.useComboboxStore({
    defaultSelectedValue: "Apple",
    resetValueOnHide: true,
  });
  const value = Ariakit.useStoreState(store, "value");
  const deferredValue = useDeferredValue(value);
  const matches = useMemo(() => getMatches(deferredValue), [deferredValue]);
  return (
    <SearchableSelect
      label="Store favorite fruit"
      matches={matches}
      searchLabel="Search store fruits"
      store={store}
    />
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
