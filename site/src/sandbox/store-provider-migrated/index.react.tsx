import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div className="ak-stack ak-gap-3">
      <button
        type="button"
        className="ak-button"
        onClick={() => {
          setOpen(true);
        }}
      >
        Show combobox
      </button>
      {open && (
        <Ariakit.ComboboxProvider>
          <Ariakit.Combobox aria-label="Search" className="ak-input" />
          <Ariakit.ComboboxList alwaysVisible aria-label="Fruits">
            <Ariakit.CompositeItem
              store={Ariakit.ComboboxProvider}
              className="ak-button"
            >
              Apple
            </Ariakit.CompositeItem>
            <Ariakit.CompositeItem
              store={Ariakit.ComboboxProvider}
              className="ak-button"
            >
              Banana
            </Ariakit.CompositeItem>
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxProvider>
      )}
    </div>
  );
}
