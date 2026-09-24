import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = ["Apple", "Banana", "Cherry", "Grape", "Orange"];

function usePreventClose() {
  const [count, setCount] = useState(0);
  const preventClose = (event: Event) => {
    event.preventDefault();
    setCount((count) => count + 1);
  };
  return [count, preventClose] as const;
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
  const [count, preventClose] = usePreventClose();
  return (
    <Ariakit.ComboboxProvider resetValueOnHide setValue={setSearch}>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Menu</Ariakit.MenuButton>
        <Ariakit.Menu onClose={preventClose}>
          <Ariakit.Combobox autoSelect aria-label="Menu search" />
          <Ariakit.ComboboxList>
            <FruitItems search={search} />
          </Ariakit.ComboboxList>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      <p>Menu closes prevented: {count}</p>
    </Ariakit.ComboboxProvider>
  );
}

// The combobox store extends the dialog store through the disclosure option.
function DialogFruits() {
  const [search, setSearch] = useState("");
  const [count, preventClose] = usePreventClose();
  const dialog = Ariakit.useDialogStore();
  return (
    <>
      <Ariakit.DialogDisclosure store={dialog}>Dialog</Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        store={dialog}
        onClose={preventClose}
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
      <p>Dialog closes prevented: {count}</p>
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
