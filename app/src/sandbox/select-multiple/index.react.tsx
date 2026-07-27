import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import { foods } from "../_select-shared.tsx";

function renderValue(value: string[]) {
  if (!value.length) return "No food selected";
  if (value.length === 1) {
    return value[0];
  }
  return `${value.length} food selected`;
}

export default function Example() {
  const [value, setValue] = useState(["Apple", "Cake"]);
  return (
    <Ariakit.SelectProvider value={value} setValue={setValue}>
      <Ariakit.SelectLabel>Favorite food</Ariakit.SelectLabel>
      <Ariakit.Select>
        {renderValue(value)}
        <Ariakit.SelectArrow />
      </Ariakit.Select>
      <Ariakit.SelectPopover gutter={4} sameWidth unmountOnHide>
        {foods.map((item) => (
          <Ariakit.SelectItem key={item} value={item}>
            <Ariakit.SelectItemCheck />
            {item}
          </Ariakit.SelectItem>
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
