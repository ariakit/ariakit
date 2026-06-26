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

const outOfStock = "Papaya";

const accessibleFruits = fruits.map((fruit) =>
  fruit === "Papaya" ? "Pawpaw" : fruit,
);

const ariaDisabledFruits = fruits.map((fruit) =>
  fruit === "Papaya" ? "Papaw" : fruit,
);

interface FixtureProps {
  accessibleWhenDisabled?: boolean;
  ariaDisabledFruit?: string;
  disabledFruit: string;
  fruits: string[];
  label: string;
}

function Fixture({
  accessibleWhenDisabled,
  ariaDisabledFruit,
  disabledFruit,
  fruits,
  label,
}: FixtureProps) {
  return (
    <Ariakit.SelectProvider defaultValue="Apple">
      <Ariakit.SelectLabel>{label}</Ariakit.SelectLabel>
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
            disabled={fruit === disabledFruit}
            {...(fruit === ariaDisabledFruit
              ? { "aria-disabled": true }
              : undefined)}
            accessibleWhenDisabled={
              fruit === disabledFruit ? accessibleWhenDisabled : undefined
            }
            offscreenMode="passive"
            style={{ display: "block", padding: "4px 8px" }}
          />
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}

export default function Example() {
  return (
    <>
      <Fixture disabledFruit={outOfStock} fruits={fruits} label="Fruit" />
      <Fixture
        accessibleWhenDisabled
        disabledFruit="Pawpaw"
        fruits={accessibleFruits}
        label="Accessible fruit"
      />
      <Fixture
        ariaDisabledFruit="Papaw"
        disabledFruit=""
        fruits={ariaDisabledFruits}
        label="ARIA disabled fruit"
      />
    </>
  );
}
