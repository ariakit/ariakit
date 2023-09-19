import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.SelectProvider defaultValue="Apple">
        <Ariakit.SelectLabel className="label">
          Favorite fruit
        </Ariakit.SelectLabel>
        <Ariakit.Select className="button" />
        <Ariakit.SelectPopover gutter={4} sameWidth className="popover">
          <Ariakit.SelectItem className="select-item" value="Apple" />
          <Ariakit.SelectItem className="select-item" value="Banana" />
          <Ariakit.SelectItem className="select-item" value="Grape" disabled />
          <Ariakit.SelectItem className="select-item" value="Orange" />
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </div>
  );
}
