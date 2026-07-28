import * as Ariakit from "@ariakit/react";
import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";

const recipes = ["Apple", "Grape", "Orange", "Strawberry", "Watermelon"];

function DelayedResults() {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const pending = inputValue !== query;

  useEffect(() => {
    const timeout = window.setTimeout(() => setQuery(inputValue), 1000);
    return () => window.clearTimeout(timeout);
  }, [inputValue]);

  const matches = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return recipes.filter((recipe) =>
      recipe.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowLeft") return;
    setInputValue(event.currentTarget.value);
  };

  return (
    <Ariakit.ComboboxProvider
      inputValue={inputValue}
      setInputValue={setInputValue}
    >
      <Ariakit.ComboboxLabel>Recipe</Ariakit.ComboboxLabel>
      <Ariakit.Combobox
        autoComplete="both"
        autoSelect
        onKeyDown={handleKeyDown}
      />
      <div role="status">
        {pending ? "Updating results…" : "Results updated"}
      </div>
      <Ariakit.ComboboxPopover>
        {matches.map((recipe) => (
          <Ariakit.ComboboxItem key={recipe} value={recipe} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  const combobox = Ariakit.useComboboxStore();
  return (
    <>
      <Ariakit.ComboboxLabel store={combobox} className="label">
        Your favorite fruit
      </Ariakit.ComboboxLabel>
      <Ariakit.Combobox
        store={combobox}
        placeholder="e.g., Apple"
        className="combobox"
        autoComplete="inline"
      />
      <Ariakit.ComboboxPopover
        store={combobox}
        gutter={8}
        sameWidth
        className="popover"
      >
        <Ariakit.ComboboxItem className="combobox-item" value="Apple">
          🍎 Apple
        </Ariakit.ComboboxItem>
        <Ariakit.ComboboxItem className="combobox-item" value="Grape">
          🍇 Grape
        </Ariakit.ComboboxItem>
        <Ariakit.ComboboxItem className="combobox-item" value="Orange">
          🍊 Orange
        </Ariakit.ComboboxItem>
        <Ariakit.ComboboxItem className="combobox-item" value="Strawberry">
          🍓 Strawberry
        </Ariakit.ComboboxItem>
        <Ariakit.ComboboxItem className="combobox-item" value="Watermelon">
          🍉 Watermelon
        </Ariakit.ComboboxItem>
      </Ariakit.ComboboxPopover>
      <DelayedResults />
    </>
  );
}
