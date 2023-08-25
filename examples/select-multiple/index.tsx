import * as Ariakit from "@ariakit/react";
import list from "./list.js";
import "./style.css";

function renderValue(value: string[]) {
  if (value.length === 0) return "No food selected";
  if (value.length === 1) return value[0];
  return `${value.length} food selected`;
}

export default function Example() {
  const select = Ariakit.useSelectStore({ defaultValue: ["Apple", "Cake"] });
  const value = select.useState("value");
  const mounted = select.useState("mounted");
  return (
    <div className="wrapper">
      <Ariakit.SelectLabel store={select}>Favorite food</Ariakit.SelectLabel>
      <Ariakit.Select store={select} className="button">
        {renderValue(value)}
        <Ariakit.SelectArrow />
      </Ariakit.Select>
      {mounted && (
        <Ariakit.SelectPopover
          store={select}
          gutter={4}
          sameWidth
          className="popover"
        >
          {list.map((value) => (
            <Ariakit.SelectItem
              key={value}
              value={value}
              className="select-item"
            >
              <Ariakit.SelectItemCheck />
              {value}
            </Ariakit.SelectItem>
          ))}
        </Ariakit.SelectPopover>
      )}
    </div>
  );
}
