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

export default function Example() {
  return (
    <>
      <FruitSelect />
      <VegetableSelect />
      <BerrySelect />
    </>
  );
}
