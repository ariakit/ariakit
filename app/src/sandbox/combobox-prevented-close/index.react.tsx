import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = Array.from({ length: 40 }, (_, index) => `Fruit ${index + 1}`);
const vegetables = Array.from(
  { length: 40 },
  (_, index) => `Vegetable ${index + 1}`,
);
const berries = Array.from({ length: 40 }, (_, index) => `Berry ${index + 1}`);

const popoverStyle = { maxHeight: 200, overflow: "auto" };

function usePreventClose() {
  const [count, setCount] = useState(0);
  const preventClose = (event: Event) => {
    event.preventDefault();
    setCount((count) => count + 1);
  };
  return [count, preventClose] as const;
}

function FruitSelect() {
  const [count, preventClose] = usePreventClose();
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Fruit 1">
      <Ariakit.ComboboxSelectLabel>Fruit</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover onClose={preventClose} style={popoverStyle}>
        {fruits.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
      <p>Fruit closes prevented: {count}</p>
    </Ariakit.ComboboxProvider>
  );
}

function VegetableSelect() {
  const [count, preventClose] = usePreventClose();
  return (
    <Ariakit.SelectProvider defaultValue="Vegetable 1">
      <Ariakit.SelectLabel>Vegetable</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover onClose={preventClose} style={popoverStyle}>
        {vegetables.map((value) => (
          <Ariakit.SelectItem key={value} value={value} />
        ))}
      </Ariakit.SelectPopover>
      <p>Vegetable closes prevented: {count}</p>
    </Ariakit.SelectProvider>
  );
}

// The popover receives the store that the provider also receives, while the
// select reads the store that the provider creates around it.
function BerrySelect() {
  const combobox = Ariakit.useComboboxStore({
    defaultSelectedValue: "Berry 1",
  });
  const [count, preventClose] = usePreventClose();
  return (
    <Ariakit.ComboboxProvider store={combobox}>
      <Ariakit.ComboboxSelectLabel>Berry</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover
        store={combobox}
        onClose={preventClose}
        style={popoverStyle}
      >
        {berries.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
      <p>Berry closes prevented: {count}</p>
    </Ariakit.ComboboxProvider>
  );
}

const searchFruits = ["Apple", "Banana", "Cherry", "Grape", "Orange"];

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

function SearchFruitItems({ search }: { search: string }) {
  const matches = searchFruits.filter((fruit) =>
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
            <SearchFruitItems search={search} />
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
            <SearchFruitItems search={search} />
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
      <FruitSelect />
      <VegetableSelect />
      <BerrySelect />
      <MenuFruits />
      <DialogFruits />
    </>
  );
}
