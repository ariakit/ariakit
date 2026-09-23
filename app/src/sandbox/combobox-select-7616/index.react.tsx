import * as Ariakit from "@ariakit/react";

const fruits = Array.from({ length: 40 }, (_, index) => `Fruit ${index + 1}`);
const vegetables = Array.from(
  { length: 40 },
  (_, index) => `Vegetable ${index + 1}`,
);

const popoverStyle = { maxHeight: 200, overflow: "auto" };

function preventClose(event: Event) {
  event.preventDefault();
}

function FruitSelect() {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Fruit 1">
      <Ariakit.ComboboxSelectLabel>Fruit</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover onClose={preventClose} style={popoverStyle}>
        {fruits.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function VegetableSelect() {
  return (
    <Ariakit.SelectProvider defaultValue="Vegetable 1">
      <Ariakit.SelectLabel>Vegetable</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover onClose={preventClose} style={popoverStyle}>
        {vegetables.map((value) => (
          <Ariakit.SelectItem key={value} value={value} />
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

export default function Example() {
  return (
    <>
      <FruitSelect />
      <VegetableSelect />
    </>
  );
}
