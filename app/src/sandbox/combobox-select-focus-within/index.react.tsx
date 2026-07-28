import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const foods = [
  "Apple",
  "Bacon",
  "Banana",
  "Burger",
  "Cake",
  "Candy",
  "Cherry",
  "Chocolate",
  "Cookie",
  "Donut",
  "Fish",
  "Fries",
  "Grape",
  "Green apple",
  "Hot dog",
  "Ice cream",
  "Kiwi",
  "Lemon",
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

export default function Example() {
  const [wrapperFocused, setWrapperFocused] = useState(false);
  const store = Ariakit.useComboboxStore({
    defaultSelectedValue: "Cookie",
    resetValueOnHide: true,
  });
  const searchValue = Ariakit.useStoreState(store, "value");
  const mounted = Ariakit.useStoreState(store, "mounted");
  const [popoverFocused, setPopoverFocused] = useState(false);
  const matches = foods.filter((value) =>
    value.toLowerCase().includes(searchValue.toLowerCase()),
  );
  const showCancel = popoverFocused || searchValue !== "";

  return (
    <>
      <div
        role="group"
        className={wrapperFocused ? "focus-within" : undefined}
        onFocus={() => setWrapperFocused(true)}
        onBlur={() => setWrapperFocused(false)}
      >
        <Ariakit.ComboboxSelectLabel store={store}>
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect store={store} />
        {mounted && (
          <Ariakit.ComboboxPopover
            store={store}
            portal
            gutter={4}
            sameWidth
            onFocus={() => setPopoverFocused(true)}
            onBlur={() => setPopoverFocused(false)}
          >
            <Ariakit.ComboboxInput
              store={store}
              autoSelect
              placeholder="Search..."
            />
            <Ariakit.ComboboxCancel
              store={store}
              data-visible={showCancel ? "" : undefined}
            />
            <Ariakit.ComboboxList store={store}>
              {matches.map((value) => (
                <Ariakit.ComboboxItem
                  key={value}
                  store={store}
                  focusOnHover
                  value={value}
                >
                  <Ariakit.ComboboxItemValue value={value} />
                </Ariakit.ComboboxItem>
              ))}
            </Ariakit.ComboboxList>
          </Ariakit.ComboboxPopover>
        )}
      </div>
      <button type="button">External button</button>
    </>
  );
}
