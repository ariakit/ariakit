import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const [counter, setCounter] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  function handleFocus() {
    setCounter((currentValue) => currentValue + 1);
  }

  return (
    <Ariakit.ComboboxProvider setValue={(newValue) => setSearchValue(newValue)}>
      Number of onFocus calls: {counter}
      <Ariakit.ComboboxLabel className="label">
        Your favorite fruit
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox
        autoSelect
        onFocus={handleFocus}
        placeholder="e.g., Apple"
        className="combobox"
      />
      <Ariakit.ComboboxPopover gutter={4} sameWidth className="popover">
        {matchText(searchValue, "Apple") ? (
          <Ariakit.ComboboxItem className="combobox-item" value="Apple">
            🍎 Apple
          </Ariakit.ComboboxItem>
        ) : null}
        {matchText(searchValue, "Grape") ? (
          <Ariakit.ComboboxItem className="combobox-item" value="Apple">
            🍇 Grape
          </Ariakit.ComboboxItem>
        ) : null}
        {matchText(searchValue, "Orange") ? (
          <Ariakit.ComboboxItem className="combobox-item" value="Apple">
            🍊 Orange
          </Ariakit.ComboboxItem>
        ) : null}
        {matchText(searchValue, "Strawberry") ? (
          <Ariakit.ComboboxItem className="combobox-item" value="Apple">
            🍓 Strawberry
          </Ariakit.ComboboxItem>
        ) : null}
        {matchText(searchValue, "Watermelon") ? (
          <Ariakit.ComboboxItem className="combobox-item" value="Apple">
            🍉 Watermelon
          </Ariakit.ComboboxItem>
        ) : null}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function matchText(searchText: string, itemText: string) {
  return itemText.toLowerCase().includes(searchText.toLowerCase());
}
