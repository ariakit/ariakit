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
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton className="button">
          Actions
          <Ariakit.MenuButtonArrow />
        </Ariakit.MenuButton>
        <Ariakit.Menu
          aria-label="Actions"
          className="popover"
          gutter={4}
          unmountOnHide
        >
          {items.map((item) => (
            <Ariakit.MenuItem key={item} className="popover-item">
              {item}
            </Ariakit.MenuItem>
          ))}
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
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
