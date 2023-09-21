import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";
import list from "./list.js";

function renderValue(value: string[]) {
  if (value.length === 0) return "No food selected";
  if (value.length === 1) return value[0];
  return `${value.length} food selected`;
}

export default function Example() {
  const [value, setValue] = useState(["Apple", "Cake"]);
  const [mounted, setMounted] = useState(false);
  return (
    <div className="wrapper">
      <Ariakit.SelectProvider
        value={value}
        setValue={setValue}
        setMounted={setMounted}
      >
        <Ariakit.SelectLabel>Favorite food</Ariakit.SelectLabel>
        <Ariakit.Select className="button">
          {renderValue(value)}
          <Ariakit.SelectArrow />
        </Ariakit.Select>
        {mounted && (
          <Ariakit.SelectPopover gutter={4} sameWidth className="popover">
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
      </Ariakit.SelectProvider>
    </div>
  );
}
