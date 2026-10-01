import * as Ariakit from "@ariakit/react";
import "./style.css";

const pageItems = Array.from(
  { length: 5000 },
  (_, index) => `Element ${index + 1}`,
);

const filters = Array.from({ length: 12 }, (_, index) => `Filter ${index + 1}`);

interface FilterMenuProps {
  label: string;
}

function FilterMenu({ label }: FilterMenuProps) {
  return (
    // No hover delay, so the perf tests measure the submenu work and not the
    // timers that precede it.
    <Ariakit.MenuProvider timeout={0}>
      <Ariakit.MenuItem
        className="popover-item"
        render={<Ariakit.MenuButton />}
      >
        {label}
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuItem>
      <Ariakit.Menu className="popover" gutter={8} portal unmountOnHide>
        <Ariakit.MenuItem className="popover-item">Is set</Ariakit.MenuItem>
        <Ariakit.MenuItem className="popover-item">Is not set</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

interface FiltersMenuProps {
  label: string;
  modal: boolean;
}

function FiltersMenu({ label, modal }: FiltersMenuProps) {
  return (
    <Ariakit.MenuProvider>
      <Ariakit.MenuButton className="button">
        {label}
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu
        className="popover"
        gutter={4}
        modal={modal}
        portal
        unmountOnHide
      >
        {filters.map((filter) => (
          <FilterMenu key={filter} label={filter} />
        ))}
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

// https://github.com/ariakit/ariakit/issues/7697
export default function Example() {
  return (
    <div className="root">
      <div className="buttons">
        <FiltersMenu label="Modal filters" modal />
        <FiltersMenu label="Nonmodal filters" modal={false} />
      </div>
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
