import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.ComboboxProvider defaultSelectedValue="Apple">
        <Ariakit.ComboboxSelectLabel className="label">
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect className="button" />
        <Ariakit.ComboboxPopover gutter={4} sameWidth className="popover">
          <Ariakit.ComboboxItem className="select-item" value="Apple" />
          <Ariakit.ComboboxItem className="select-item" value="Banana" />
          <Ariakit.ComboboxItem
            className="select-item"
            value="Grape"
            disabled
          />
          <Ariakit.ComboboxItem className="select-item" value="Orange" />
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </div>
  );
}
