import * as Ariakit from "@ariakit/react";
import { SelectItem } from "@ariakit/react-components/select/select-item-offscreen";

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Cherry",
  "Clementine",
  "Coconut",
  "Cranberry",
  "Date",
  "Dragon fruit",
  "Durian",
  "Elderberry",
  "Fig",
  "Grape",
  "Grapefruit",
  "Guava",
  "Honeydew",
  "Jackfruit",
  "Kiwi",
  "Kumquat",
  "Lemon",
  "Lime",
  "Lychee",
  "Mango",
  "Melon",
  "Nectarine",
  "Orange",
  "Papaya",
  "Peach",
  "Pear",
  "Pineapple",
  "Plum",
  "Pomegranate",
  "Quince",
  "Raspberry",
  "Strawberry",
  "Watermelon",
];

const outOfStock = ["Papaya"];

export default function Example() {
  return (
    <Ariakit.SelectProvider defaultValue="Apple">
      <Ariakit.SelectLabel>Fruit</Ariakit.SelectLabel>
      <Ariakit.Select style={{ display: "block" }} />
      <Ariakit.SelectPopover
        gutter={4}
        sameWidth
        style={{
          background: "white",
          border: "1px solid gray",
          maxHeight: 120,
          overflow: "auto",
        }}
      >
        {fruits.map((fruit) => (
          <SelectItem
            key={fruit}
            value={fruit}
            disabled={outOfStock.includes(fruit)}
            offscreenMode="passive"
            style={{ display: "block", padding: "4px 8px" }}
          />
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
