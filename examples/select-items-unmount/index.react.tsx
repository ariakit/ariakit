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
  ] satisfies Ariakit.SelectItemProps[];
  return (
    <div className="wrapper">
      <Ariakit.SelectProvider defaultItems={items} defaultValue="Apple">
        <Ariakit.SelectLabel className="label">
          Favorite fruit
        </Ariakit.SelectLabel>
        <Ariakit.Select className="button" />
        <Ariakit.SelectPopover
          sameWidth
          gutter={4}
          unmountOnHide
          className="popover"
        >
          {items.map((item) => (
            <Ariakit.SelectItem
              key={item.id}
              className="select-item"
              {...item}
            />
          ))}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </div>
  );
}
