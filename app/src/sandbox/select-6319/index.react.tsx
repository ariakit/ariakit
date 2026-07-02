import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = ["Apple", "Banana", "Cherry"];
const colors = ["Red", "Green", "Blue"];

const popoverStyle = {
  background: "white",
  border: "1px solid gray",
  padding: 4,
};

export default function Example() {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const fruit = Ariakit.useSelectStore({ defaultValue: "Cherry" });
  const color = Ariakit.useSelectStore({ defaultValue: "Green" });
  return (
    <>
      <div>
        <Ariakit.SelectLabel store={fruit}>Favorite fruit</Ariakit.SelectLabel>
        <Ariakit.Select store={fruit} />
        <Ariakit.SelectPopover
          store={fruit}
          gutter={4}
          sameWidth
          style={popoverStyle}
        >
          {fruits.map((value) => (
            <Ariakit.SelectItem key={value} value={value} />
          ))}
          {/* Action items at the end of the list, rendered as SelectItems
              without the optional value prop so they take part in keyboard
              navigation. */}
          <Ariakit.SelectItem hideOnClick onClick={() => fruit.setValue("")}>
            Clear selection
          </Ariakit.SelectItem>
          <Ariakit.SelectItem
            hideOnClick
            onClick={() => setShowCustomInput(true)}
          >
            Other fruit…
          </Ariakit.SelectItem>
        </Ariakit.SelectPopover>
        {showCustomInput && <input aria-label="Other fruit" />}
      </div>
      <div>
        <Ariakit.SelectLabel store={color}>Favorite color</Ariakit.SelectLabel>
        <Ariakit.Select store={color} showOnKeyDown={false} />
        <Ariakit.SelectPopover
          store={color}
          gutter={4}
          sameWidth
          style={popoverStyle}
        >
          {colors.map((value) => (
            <Ariakit.SelectItem key={value} value={value} />
          ))}
          <Ariakit.SelectItem hideOnClick onClick={() => color.setValue("")}>
            Clear selection
          </Ariakit.SelectItem>
        </Ariakit.SelectPopover>
      </div>
    </>
  );
}
