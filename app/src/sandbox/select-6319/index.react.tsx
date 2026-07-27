import * as Ariakit from "@ariakit/react";
import { useState } from "react";

const fruits = ["Apple", "Banana", "Cherry"];
const colors = ["Red", "Green", "Blue"];
const shapes = ["Square", "Circle", "Triangle"];

const popoverStyle = {
  background: "white",
  border: "1px solid gray",
  padding: 4,
};

export default function Example() {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const fruit = Ariakit.useComboboxStore({
    defaultSelectedValue: "Cherry",
  });
  const color = Ariakit.useComboboxStore({
    defaultSelectedValue: "Green",
  });
  const shape = Ariakit.useComboboxStore({
    defaultSelectedValue: "Triangle",
    focusLoop: true,
  });
  return (
    <>
      <div>
        <Ariakit.ComboboxSelectLabel store={fruit}>
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect store={fruit} />
        <Ariakit.ComboboxPopover
          store={fruit}
          gutter={4}
          sameWidth
          style={popoverStyle}
        >
          {fruits.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
          {/* Action items at the end of the list, rendered as SelectItems
              without the optional value prop so they take part in keyboard
              navigation. */}
          <Ariakit.ComboboxItem
            hideOnClick
            onClick={() => fruit.setSelectedValue("")}
          >
            Clear selection
          </Ariakit.ComboboxItem>
          <Ariakit.ComboboxItem
            hideOnClick
            onClick={() => setShowCustomInput(true)}
          >
            Other fruit…
          </Ariakit.ComboboxItem>
        </Ariakit.ComboboxPopover>
        {showCustomInput && <input aria-label="Other fruit" />}
      </div>
      <div>
        <Ariakit.ComboboxSelectLabel store={color}>
          Favorite color
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect store={color} showOnKeyDown={false} />
        <Ariakit.ComboboxPopover
          store={color}
          gutter={4}
          sameWidth
          style={popoverStyle}
        >
          {colors.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
          <Ariakit.ComboboxItem
            hideOnClick
            onClick={() => color.setSelectedValue("")}
          >
            Clear selection
          </Ariakit.ComboboxItem>
        </Ariakit.ComboboxPopover>
      </div>
      <div>
        <Ariakit.ComboboxSelectLabel store={shape}>
          Favorite shape
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect store={shape} showOnKeyDown={false} />
        <Ariakit.ComboboxPopover
          store={shape}
          gutter={4}
          sameWidth
          style={popoverStyle}
        >
          {shapes.map((value) => (
            <Ariakit.ComboboxItem key={value} value={value} />
          ))}
          <Ariakit.ComboboxItem
            hideOnClick
            onClick={() => shape.setSelectedValue("")}
          >
            Clear selection
          </Ariakit.ComboboxItem>
        </Ariakit.ComboboxPopover>
      </div>
    </>
  );
}
