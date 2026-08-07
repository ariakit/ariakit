import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";
import { vegetables } from "../combobox-select-default-open/vegetables.ts";

const firstOptions = vegetables.slice(0, 4);

export default function Example() {
  const store = Ariakit.useComboboxStore({ defaultSelectedValue: "Onion" });
  const open = Ariakit.useStoreState(store, "open");
  const [options, setOptions] = useState(firstOptions);

  // A global shortcut opens the picker programmatically, leaving focus wherever
  // the user left it, so the open never passes through the select.
  // A button that refuses focus would not do: Safari falls back to the last
  // mousedown target for the disclosure element, so the open would carry an
  // opener there and not in the other engines.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "F2") return;
      store.show();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [store]);

  // Restores the short list on close so the preview can be replayed by hand
  // without reloading the page.
  useEffect(() => {
    if (open) return;
    setOptions(firstOptions);
  }, [open]);

  // The selected Onion is among the remaining options, so the opening
  // presentation only has something to target once they register.
  const loadRemainingOptions = () => setOptions(vegetables);

  return (
    // A block wrapper, because the preview lays its children out in a row and a
    // spacer would otherwise push the picker sideways instead of below the fold.
    <div>
      {/* Starts the picker outside the viewport, so the scroll that taking
      focus performs is observable. */}
      <div style={{ height: 1500 }} />
      <p>Press F2 to open the vegetable picker.</p>
      <label>
        Note
        <input type="text" />
      </label>
      <Ariakit.ComboboxSelectLabel store={store}>
        Vegetable
      </Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect store={store} />
      {/* Refuses the focus a click would take, so loading the remaining
      options is not itself a focus move out of the picker. */}
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={loadRemainingOptions}
      >
        Load all vegetables
      </button>
      <Ariakit.ComboboxPopover
        store={store}
        // Clicking the note field must abandon the pending presentation rather
        // than close the popup, so the list position stays observable.
        hideOnInteractOutside={false}
        gutter={4}
        sameWidth
        style={{ background: "white", border: "1px solid gray" }}
      >
        {/* The list owns the scrollport so it is both the listbox and the
        element the opening presentation scrolls. */}
        <Ariakit.ComboboxList
          store={store}
          style={{ maxHeight: 120, overflow: "auto" }}
        >
          {options.map((value) => (
            <Ariakit.ComboboxItem
              store={store}
              key={value}
              value={value}
              style={{ display: "block", padding: "4px 8px" }}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </div>
  );
}
