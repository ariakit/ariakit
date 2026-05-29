import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.SelectProvider defaultValue="Apple">
        <Ariakit.SelectLabel className="label">
          Favorite fruit
        </Ariakit.SelectLabel>
        <Ariakit.Select className="button" />
        <Ariakit.SelectPopover gutter={4} sameWidth className="popover">
          <Ariakit.SelectItem
            className="select-item"
            value="Apple"
            typeaheadText="Apple"
          >
            🍎 Apple
          </Ariakit.SelectItem>
          <Ariakit.SelectItem
            className="select-item"
            value="Banana"
            typeaheadText="Banana"
          >
            🍌 Banana
          </Ariakit.SelectItem>
          <Ariakit.SelectItem
            className="select-item"
            value="Grape"
            typeaheadText="Grape"
            disabled
          >
            🍇 Grape
          </Ariakit.SelectItem>
          <Ariakit.SelectItem
            className="select-item"
            value="Orange"
            typeaheadText="Orange"
          >
            🍊 Orange
          </Ariakit.SelectItem>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </div>
  );
}
