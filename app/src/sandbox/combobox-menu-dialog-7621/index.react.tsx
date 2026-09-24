import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = ["Apple", "Banana", "Cherry", "Grape", "Orange"];

function useClose() {
  const [count, setCount] = useState(0);
  const [keepOpen, setKeepOpen] = useState(true);
  const onClose = (event: Event) => {
    setCount((count) => count + 1);
    if (!keepOpen) return;
    event.preventDefault();
  };
  return { count, keepOpen, setKeepOpen, onClose };
}

interface CloseStatusProps {
  label: string;
  close: ReturnType<typeof useClose>;
}

function CloseStatus({ label, close }: CloseStatusProps) {
  return (
    <>
      <label>
        <Ariakit.Checkbox
          checked={close.keepOpen}
          onChange={(event) => close.setKeepOpen(event.target.checked)}
        />
        Keep {label} open
      </label>
      <p>
        {label} close events: {close.count}
      </p>
    </>
  );
}

function FruitItems({ search }: { search: string }) {
  const matches = fruits.filter((fruit) =>
    fruit.toLowerCase().includes(search.toLowerCase()),
  );
  return matches.map((fruit) => (
    <Ariakit.ComboboxItem key={fruit} value={fruit} setValueOnClick={false} />
  ));
}

// The menu store extends the combobox store from the provider through the
// combobox option.
function MenuFruits() {
  const [search, setSearch] = useState("");
  const close = useClose();
  return (
    <Ariakit.ComboboxProvider resetValueOnHide setValue={setSearch}>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Menu</Ariakit.MenuButton>
        <Ariakit.Menu onClose={close.onClose}>
          <Ariakit.Combobox autoSelect aria-label="Menu search" />
          <Ariakit.ComboboxList>
            <FruitItems search={search} />
          </Ariakit.ComboboxList>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <CloseStatus label="Menu" close={close} />
    </Ariakit.ComboboxProvider>
  );
}

// The combobox store extends the dialog store through the disclosure option.
function DialogFruits() {
  const [search, setSearch] = useState("");
  const close = useClose();
  const dialog = Ariakit.useDialogStore();
  return (
    <>
      <Ariakit.DialogDisclosure store={dialog}>Dialog</Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        store={dialog}
        onClose={close.onClose}
        aria-label="Dialog"
        style={{ position: "relative", zIndex: 1 }}
      >
        <Ariakit.ComboboxProvider
          disclosure={dialog}
          resetValueOnHide
          setValue={setSearch}
        >
          <Ariakit.Combobox autoSelect aria-label="Dialog search" />
          <Ariakit.ComboboxList>
            <FruitItems search={search} />
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxProvider>
      </Ariakit.Dialog>
      <CloseStatus label="Dialog" close={close} />
    </>
  );
}

export default function Example() {
  return (
    <>
      <MenuFruits />
      <DialogFruits />
    </>
  );
}
