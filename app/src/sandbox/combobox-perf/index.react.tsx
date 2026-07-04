import * as Ariakit from "@ariakit/react";
import "./style.css";

const pageItems = Array.from(
  { length: 5000 },
  (_, index) => `Element ${index + 1}`,
);

const items = Array.from({ length: 200 }, (_, index) => `Item ${index + 1}`);

export default function Example() {
  return (
    <div className="root">
      <Ariakit.ComboboxProvider>
        <Ariakit.ComboboxLabel className="label">
          Search items
        </Ariakit.ComboboxLabel>
        <Ariakit.Combobox className="combobox" placeholder="Search items" />
        <Ariakit.ComboboxPopover
          className="popover"
          gutter={4}
          sameWidth
          unmountOnHide
        >
          {items.map((item) => (
            <Ariakit.ComboboxItem
              key={item}
              className="popover-item"
              value={item}
            />
          ))}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
      <div className="grid">
        {pageItems.map((item) => (
          <button key={item} className="card" type="button">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
