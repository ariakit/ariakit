import * as Ariakit from "@ariakit/react";
import { useId, useState } from "react";

function Autocomplete() {
  const [open, setOpen] = useState(true);
  const inputId = useId();
  const listboxId = useId();

  return (
    <div>
      <label htmlFor={inputId}>Search</label>
      <input
        id={inputId}
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-autocomplete="list"
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          if (!open) return;
          event.stopPropagation();
          setOpen(false);
        }}
      />
      {open && (
        <div id={listboxId} role="listbox" aria-label="Suggestions">
          <div role="option" aria-selected="false">
            Ariakit
          </div>
        </div>
      )}
    </div>
  );
}

export default function Example() {
  return (
    <Ariakit.DialogProvider>
      <Ariakit.DialogDisclosure>Open dialog</Ariakit.DialogDisclosure>
      <Ariakit.Dialog>
        <Ariakit.DialogHeading>Dialog</Ariakit.DialogHeading>
        <Autocomplete />
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  );
}
