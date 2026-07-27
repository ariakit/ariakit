import * as Ariakit from "@ariakit/react";
import { useEffect, useMemo, useState } from "react";

const items = Array.from({ length: 30 }, (_, index) => `Item ${index + 1}`);
const selectedValue = "Item 24";
const foods = [
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
const foodItems = foods.map((value) => ({
  id: `food-${value.toLowerCase().replaceAll(" ", "-")}`,
  value,
}));

interface FixtureProps {
  label: string;
  lateItems?: boolean;
}

function Fixture({ label, lateItems }: FixtureProps) {
  const [open, setOpen] = useState(false);
  const [showLateItems, setShowLateItems] = useState(false);

  useEffect(() => {
    if (!lateItems) return;
    if (!open) {
      setShowLateItems(false);
      return;
    }
    const timeout = window.setTimeout(() => setShowLateItems(true), 750);
    return () => window.clearTimeout(timeout);
  }, [lateItems, open]);

  const renderedItems = lateItems && !showLateItems ? items.slice(0, 4) : items;

  return (
    <Ariakit.ComboboxProvider
      setOpen={setOpen}
      defaultSelectedValue={selectedValue}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block" }} />
      <Ariakit.ComboboxPopover
        unmountOnHide
        gutter={4}
        sameWidth
        aria-label={`${label} options`}
        style={{
          background: "white",
          border: "1px solid gray",
          maxHeight: 120,
          overflow: "auto",
        }}
      >
        {renderedItems.map((item) => (
          <Ariakit.ComboboxItem
            key={item}
            value={item}
            style={{ display: "block", padding: "4px 8px" }}
          />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function SearchableSelect() {
  const [searchValue, setSearchValue] = useState("");
  const store = Ariakit.useComboboxStore({
    defaultItems: foodItems,
    defaultSelectedValue: "Apple",
    resetValueOnHide: true,
    value: searchValue,
    setValue: setSearchValue,
  });
  const matches = useMemo(() => {
    const query = searchValue.toLowerCase();
    return foodItems
      .filter((item) => item.value.toLowerCase().includes(query))
      .sort((firstItem, secondItem) => {
        const firstStartsWithQuery = firstItem.value
          .toLowerCase()
          .startsWith(query);
        const secondStartsWithQuery = secondItem.value
          .toLowerCase()
          .startsWith(query);
        if (firstStartsWithQuery === secondStartsWithQuery) return 0;
        return firstStartsWithQuery ? -1 : 1;
      });
  }, [searchValue]);

  return (
    <>
      <Ariakit.ComboboxSelectLabel store={store}>
        Searchable favorite fruit
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={store} />
      <Ariakit.ComboboxPopover
        store={store}
        aria-label="Searchable favorite fruit options"
        gutter={4}
        sameWidth
        style={{ maxHeight: 160, overflow: "auto" }}
      >
        <Ariakit.ComboboxInput
          store={store}
          autoSelect="always"
          aria-label="Search fruits"
          placeholder="Search..."
        />
        <Ariakit.ComboboxList store={store}>
          {matches.map((item) => (
            <Ariakit.ComboboxItem
              store={store}
              key={item.id}
              id={item.id}
              value={item.value}
              style={{ display: "block", padding: "4px 8px" }}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </>
  );
}

const foodGroups = [
  ["Fruits & Vegetables", ["Apple", "Banana", "Grape", "Orange"]],
  ["Dairy", ["Milk", "Cheese", "Yogurt"]],
  ["Beverages", ["Water", "Juice", "Soda"]],
  ["Snacks", ["Chips", "Nuts", "Candy"]],
] as const;

function GroupedSelect() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
      <Ariakit.ComboboxSelectLabel>
        Grouped favorite food
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover
        gutter={4}
        sameWidth
        style={{ maxHeight: 120, overflow: "auto" }}
      >
        {foodGroups.map(([label, groupItems]) => (
          <Ariakit.ComboboxGroup key={label}>
            <Ariakit.ComboboxGroupLabel
              style={{ padding: 8, scrollMarginTop: 40 }}
            >
              {label}
            </Ariakit.ComboboxGroupLabel>
            {groupItems.map((value) => (
              <Ariakit.ComboboxItem
                key={value}
                value={value}
                style={{ display: "block", padding: "4px 8px" }}
              />
            ))}
          </Ariakit.ComboboxGroup>
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <main style={{ minHeight: 1_000 }}>
      <Fixture label="Pointer race" />
      <Fixture label="Late items" lateItems />
      <SearchableSelect />
      <GroupedSelect />
    </main>
  );
}
