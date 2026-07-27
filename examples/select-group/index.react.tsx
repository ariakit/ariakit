import {
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxPopover,
  ComboboxProvider,
  ComboboxSelect,
  ComboboxSelectLabel,
} from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <div className="wrapper">
      <ComboboxProvider defaultSelectedValue="Apple">
        <ComboboxSelectLabel>Favorite food</ComboboxSelectLabel>
        <ComboboxSelect className="button" />
        <ComboboxPopover gutter={4} sameWidth className="popover">
          <ComboboxGroup className="group">
            <ComboboxGroupLabel className="group-label">
              Fruits &amp; Vegetables
            </ComboboxGroupLabel>
            <ComboboxItem className="select-item" value="Apple" />
            <ComboboxItem className="select-item" value="Banana" />
            <ComboboxItem className="select-item" value="Grape" />
            <ComboboxItem className="select-item" value="Orange" />
          </ComboboxGroup>
          <ComboboxGroup className="group group-separator">
            <ComboboxGroupLabel className="group-label">
              Dairy
            </ComboboxGroupLabel>
            <ComboboxItem className="select-item" value="Milk" />
            <ComboboxItem className="select-item" value="Cheese" />
            <ComboboxItem className="select-item" value="Yogurt" />
          </ComboboxGroup>
          <ComboboxGroup className="group group-separator">
            <ComboboxGroupLabel className="group-label">
              Beverages
            </ComboboxGroupLabel>
            <ComboboxItem className="select-item" value="Water" />
            <ComboboxItem className="select-item" value="Juice" />
            <ComboboxItem className="select-item" value="Soda" />
          </ComboboxGroup>
          <ComboboxGroup className="group group-separator">
            <ComboboxGroupLabel className="group-label">
              Snacks
            </ComboboxGroupLabel>
            <ComboboxItem className="select-item" value="Chips" />
            <ComboboxItem className="select-item" value="Nuts" />
            <ComboboxItem className="select-item" value="Candy" />
          </ComboboxGroup>
        </ComboboxPopover>
      </ComboboxProvider>
    </div>
  );
}
