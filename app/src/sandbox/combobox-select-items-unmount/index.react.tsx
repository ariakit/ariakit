import * as Ariakit from "@ariakit/react";
import { useId } from "react";

export default function Example() {
  const baseId = useId();
  const items = [
    { id: `${baseId}/apple`, value: "Apple" },
    { id: `${baseId}/banana`, value: "Banana" },
    { id: `${baseId}/grape`, value: "Grape", disabled: true },
    { id: `${baseId}/orange`, value: "Orange" },
  ] satisfies Ariakit.ComboboxItemProps[];
  return (
    <Ariakit.ComboboxProvider defaultItems={items} defaultSelectedValue="Apple">
      <Ariakit.ComboboxSelectLabel>Favorite fruit</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect />
      <Ariakit.ComboboxPopover sameWidth gutter={4} unmountOnHide>
        {items.map((item) => (
          <Ariakit.ComboboxItem key={item.id} {...item} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}
