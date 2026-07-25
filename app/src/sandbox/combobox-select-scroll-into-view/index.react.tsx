import * as Ariakit from "@ariakit/react";

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Cherry",
  "Coconut",
  "Fig",
  "Grape",
  "Kiwi",
  "Lemon",
  "Mango",
  "Melon",
  "Orange",
  "Papaya",
  "Peach",
  "Pear",
  "Plum",
  "Watermelon",
];

const vegetables = [
  "Artichoke",
  "Asparagus",
  "Beetroot",
  "Broccoli",
  "Cabbage",
  "Carrot",
  "Celery",
  "Cucumber",
  "Eggplant",
  "Fennel",
  "Garlic",
  "Leek",
  "Lettuce",
  "Onion",
  "Parsnip",
  "Potato",
  "Pumpkin",
  "Zucchini",
];

interface SelectProps {
  label: string;
  values: string[];
  defaultSelectedValue: string;
  defaultOpen?: boolean;
  filter?: boolean;
}

function Select({
  label,
  values,
  defaultSelectedValue,
  defaultOpen,
  filter,
}: SelectProps) {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue={defaultSelectedValue}
      defaultOpen={defaultOpen}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block" }} />
      <Ariakit.ComboboxPopover
        gutter={4}
        sameWidth
        autoFocusOnShow={filter ? false : undefined}
        style={{
          background: "white",
          border: "1px solid gray",
          maxHeight: 120,
          overflow: "auto",
        }}
      >
        {filter && <Ariakit.ComboboxInput aria-label={`Filter ${label}`} />}
        {values.map((value) => (
          <Ariakit.ComboboxItem
            key={value}
            value={value}
            style={{ display: "block", padding: "4px 8px" }}
          />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      {/* The selected item sits in the middle of the list so centering it is
      distinguishable from bringing it to the nearest edge, which clamps to the
      same position for an item at either end. */}
      <Select label="Fruit" values={fruits} defaultSelectedValue="Orange" />
      {/* The popup is already open on the first render, so there's no open
      transition for the scroll to react to, and the store only points the
      active item at the selection a commit later. */}
      <Select
        label="Vegetable"
        values={vegetables}
        defaultSelectedValue="Onion"
        defaultOpen
      />
      {/* The input becomes the composite element, and opting out of the
      popover's autofocus leaves DOM focus on the select. Presenting the item by
      focusing it would hand focus to the input instead of leaving it alone. */}
      <Select
        label="Filtered fruit"
        values={fruits}
        defaultSelectedValue="Orange"
        filter
      />
    </>
  );
}
