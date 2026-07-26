import * as Ariakit from "@ariakit/react";
import { useId } from "react";
import "./style.css";

export default function Example() {
  const baseId = useId();
  const items = [
    { id: `${baseId}/apple`, value: "Apple" },
    { id: `${baseId}/banana`, value: "Banana" },
    { id: `${baseId}/grape`, value: "Grape", disabled: true },
    { id: `${baseId}/orange`, value: "Orange" },
  ] satisfies Ariakit.ComboboxItemProps[];
  return (
    <div className="wrapper">
      <Ariakit.ComboboxProvider
        defaultItems={items}
        defaultSelectedValue="Apple"
      >
        <Ariakit.ComboboxSelectLabel className="label">
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect className="button" />
        <Ariakit.ComboboxPopover
          sameWidth
          gutter={4}
          unmountOnHide
          className="popover"
        >
          {items.map((item) => (
            <Ariakit.ComboboxItem
              key={item.id}
              className="select-item"
              {...item}
            />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </div>
  );
}
