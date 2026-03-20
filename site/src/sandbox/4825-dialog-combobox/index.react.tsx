import * as Ariakit from "@ariakit/react";
import { useMemo, useState, startTransition } from "react";

const allItems = [
  "Apple",
  "Banana",
  "Blueberry",
  "Cherry",
  "Cranberry",
  "Grape",
  "Grapefruit",
  "Lemon",
  "Mango",
  "Orange",
  "Papaya",
  "Peach",
  "Pineapple",
  "Raspberry",
  "Strawberry",
  "Watermelon",
];

export default function Example() {
  const [open, setOpen] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const matches = useMemo(() => {
    if (!searchValue) return allItems;
    return allItems.filter((item) =>
      item.toLowerCase().includes(searchValue.toLowerCase().trim()),
    );
  }, [searchValue]);

  const dialog = Ariakit.useDialogStore({ open, setOpen });

  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)}>
        Open Command Menu
      </Ariakit.Button>
      <Ariakit.Dialog store={dialog} unmountOnHide>
        <Ariakit.ComboboxProvider
          disclosure={dialog}
          focusLoop={false}
          includesBaseElement={false}
          resetValueOnHide
          setValue={(value) => {
            startTransition(() => {
              setSearchValue(value);
            });
          }}
        >
          <Ariakit.Combobox
            autoSelect="always"
            placeholder="Search for fruits..."
            style={{ width: 100 }}
          />
          <Ariakit.ComboboxList>
            {matches.map((item) => (
              <Ariakit.ComboboxItem key={item} value={item}>
                {item}
              </Ariakit.ComboboxItem>
            ))}
            {!matches.length && <div>No results found</div>}
          </Ariakit.ComboboxList>
        </Ariakit.ComboboxProvider>
      </Ariakit.Dialog>
    </>
  );
}
