import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = ["Apple", "Banana", "Cherry", "Grape", "Orange"];

function usePreventClose() {
  const [count, setCount] = useState(0);
  const countPreventedClose = () => setCount((count) => count + 1);
  const preventClose = (event: Event) => {
    event.preventDefault();
    countPreventedClose();
  };
  return [count, preventClose, countPreventedClose] as const;
}

interface FruitItemsProps {
  search: string;
  onPreventClose: () => void;
}

function FruitItems({ search, onPreventClose }: FruitItemsProps) {
  const matches = fruits.filter((fruit) =>
    fruit.toLowerCase().includes(search.toLowerCase()),
  );
  return matches.map((fruit) => (
    <Ariakit.ComboboxItem
      key={fruit}
      value={fruit}
      setValueOnClick={false}
      // The item hides the linked combobox store, which resets the popup before
      // onClose can prevent the close, so the item makes that decision instead.
      // TODO: Remove this workaround when
      // https://github.com/ariakit/ariakit/issues/7621 is fixed.
      hideOnClick={() => {
        onPreventClose();
        return false;
      }}
    />
  ));
}

// The menu store extends the combobox store from the provider through the
// combobox option.
function MenuFruits() {
  const [search, setSearch] = useState("");
  const [count, preventClose, countPreventedClose] = usePreventClose();
  return (
    <Ariakit.ComboboxProvider resetValueOnHide setValue={setSearch}>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Menu</Ariakit.MenuButton>
        <Ariakit.Menu onClose={preventClose}>
          <Ariakit.Combobox autoSelect aria-label="Menu search" />
          <Ariakit.ComboboxList>
            <FruitItems search={search} onPreventClose={countPreventedClose} />
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
  const [count, preventClose, countPreventedClose] = usePreventClose();
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
            <FruitItems search={search} onPreventClose={countPreventedClose} />
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
