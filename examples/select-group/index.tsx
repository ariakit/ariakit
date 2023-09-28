import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.SelectProvider defaultValue="Apple">
        <Ariakit.SelectLabel>Favorite food</Ariakit.SelectLabel>
        <Ariakit.Select className="button" />
        <Ariakit.SelectPopover gutter={4} sameWidth className="popover">
          <Ariakit.SelectGroup className="group">
            <Ariakit.SelectGroupLabel className="group-label">
              Fruits &amp; Vegetables
            </Ariakit.SelectGroupLabel>
            <Ariakit.SelectItem className="select-item" value="Apple" />
            <Ariakit.SelectItem className="select-item" value="Banana" />
            <Ariakit.SelectItem className="select-item" value="Grape" />
            <Ariakit.SelectItem className="select-item" value="Orange" />
          </Ariakit.SelectGroup>
          <Ariakit.SelectSeparator className="separator" />
          <Ariakit.SelectGroup className="group">
            <Ariakit.SelectGroupLabel className="group-label">
              Dairy
            </Ariakit.SelectGroupLabel>
            <Ariakit.SelectItem className="select-item" value="Milk" />
            <Ariakit.SelectItem className="select-item" value="Cheese" />
            <Ariakit.SelectItem className="select-item" value="Yogurt" />
          </Ariakit.SelectGroup>
          <Ariakit.SelectSeparator className="separator" />
          <Ariakit.SelectGroup className="group">
            <Ariakit.SelectGroupLabel className="group-label">
              Beverages
            </Ariakit.SelectGroupLabel>
            <Ariakit.SelectItem className="select-item" value="Water" />
            <Ariakit.SelectItem className="select-item" value="Juice" />
            <Ariakit.SelectItem className="select-item" value="Soda" />
          </Ariakit.SelectGroup>
          <Ariakit.SelectSeparator className="separator" />
          <Ariakit.SelectGroup className="group">
            <Ariakit.SelectGroupLabel className="group-label">
              Snacks
            </Ariakit.SelectGroupLabel>
            <Ariakit.SelectItem className="select-item" value="Chips" />
            <Ariakit.SelectItem className="select-item" value="Nuts" />
            <Ariakit.SelectItem className="select-item" value="Candy" />
          </Ariakit.SelectGroup>
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
    </div>
  );
}
