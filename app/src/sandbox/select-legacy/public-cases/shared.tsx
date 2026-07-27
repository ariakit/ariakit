import * as Ariakit from "@ariakit/react";

export const fruits = ["Apple", "Banana", "Grape", "Orange"] as const;

export const foods = [
  "Apple",
  "Banana",
  "Broccoli",
  "Cake",
  "Chocolate",
] as const;

export function FruitItems() {
  return (
    <>
      {fruits.map((value) => (
        <Ariakit.SelectItem key={value} value={value}>
          {value}
        </Ariakit.SelectItem>
      ))}
    </>
  );
}

export function BasicSelectPopover() {
  return (
    <Ariakit.SelectPopover gutter={4} sameWidth unmountOnHide>
      <FruitItems />
    </Ariakit.SelectPopover>
  );
}
