import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = ["Apple", "Banana", "Cherry", "Grape", "Lemon", "Orange"];

interface FruitSelectProps {
  label: string;
  listTabIndex?: number;
}

function FruitSelect({ label, listTabIndex }: FruitSelectProps) {
  const [value, setValue] = useState("");
  const matches = fruits.filter((fruit) =>
    fruit.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <Ariakit.ComboboxProvider setValue={setValue}>
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover gutter={4}>
        <Ariakit.ComboboxInput aria-label={`Search ${label}`} />
        <Ariakit.ComboboxList
          aria-label={`${label} options`}
          tabIndex={listTabIndex}
          style={{ height: 40, overflow: "auto" }}
        >
          {matches.map((fruit) => (
            <Ariakit.ComboboxItem key={fruit} value={fruit} />
          ))}
          {!matches.length && <div role="status">No results</div>}
        </Ariakit.ComboboxList>
        <Ariakit.Button>After {label} options</Ariakit.Button>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <FruitSelect label="Default fruit" />
      <FruitSelect label="Opt-in fruit" listTabIndex={0} />
    </>
  );
}
