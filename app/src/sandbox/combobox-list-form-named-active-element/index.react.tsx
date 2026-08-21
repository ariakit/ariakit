import * as Ariakit from "@ariakit/react";
import { useRef, useState } from "react";

const fruits = ["Apple", "Banana", "Cherry", "Grape"];

// A saved-searches form on the page carries a name that collides with the
// member `ComboboxList` reads to confirm the list still holds focus, so the
// document answers `activeElement` with the form. The redirect that hands
// focus back to the combobox never runs, and the list keeps DOM focus that
// belongs on the input.
export default function Example() {
  const comboboxRef = useRef<HTMLInputElement>(null);
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const recordFocus = (name: string) => {
    setFocusHistory((history) => [...history, name]);
  };

  return (
    <main>
      <h1>Fruits</h1>

      <form name="activeElement" aria-label="Saved searches">
        <label>
          Search name
          <input name="search" defaultValue="Citrus" />
        </label>
      </form>

      {/* The named form makes `document.activeElement` answer with itself, so
          Playwright's `toBeFocused` can never pass on this page: it compares
          `getRootNode().activeElement` against the node. Focus is reported
          through the output below instead. */}
      <Ariakit.ComboboxProvider>
        <Ariakit.Combobox
          ref={comboboxRef}
          aria-label="Fruit"
          onFocus={() => recordFocus("combobox")}
        />
        {/* The padding gives the list a band that belongs to the list itself,
            so a click there focuses it instead of an item. */}
        <Ariakit.ComboboxList
          alwaysVisible
          aria-label="Fruit options"
          style={{ padding: 24 }}
          onFocus={(event) => {
            if (event.target !== event.currentTarget) return;
            recordFocus("list");
            // TODO: Remove once the list reads activeElement through the
            // hardened accessor.
            // https://github.com/ariakit/ariakit/issues/7230
            queueMicrotask(() => comboboxRef.current?.focus());
          }}
        >
          {fruits.map((fruit) => (
            <Ariakit.ComboboxItem key={fruit} value={fruit} />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxProvider>

      <output aria-label="Focus history">
        {focusHistory.join(" → ") || "none"}
      </output>
    </main>
  );
}
