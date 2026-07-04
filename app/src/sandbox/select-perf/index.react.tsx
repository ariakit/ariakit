import * as Ariakit from "@ariakit/react";
import "./style.css";

const pageItems = Array.from(
  { length: 5000 },
  (_, index) => `Element ${index + 1}`,
);

const items = Array.from({ length: 20 }, (_, index) => `Item ${index + 1}`);

export default function Example() {
  return (
    <div className="root">
      <Ariakit.SelectProvider defaultValue={items[0]}>
        <Ariakit.SelectLabel className="label">Choose item</Ariakit.SelectLabel>
        <Ariakit.Select className="button" />
        <Ariakit.SelectPopover
          className="popover"
          gutter={4}
          sameWidth
          unmountOnHide
        >
          {items.map((item) => (
            <Ariakit.SelectItem
              key={item}
              className="popover-item"
              value={item}
            />
          ))}
        </Ariakit.SelectPopover>
      </Ariakit.SelectProvider>
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
