import * as Ariakit from "@ariakit/react";

const list = ["Apple", "Banana", "Cherry", "Grape", "Lemon", "Orange"];

export default function Example() {
  return (
    <Ariakit.SelectProvider defaultValue="Apple">
      <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover gutter={4} sameWidth unmountOnHide>
        {list.map((value) => (
          <Ariakit.SelectItem id={undefined} key={value} value={value} />
        ))}
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
