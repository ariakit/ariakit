import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

const itemCount = 400;
const items = Array.from(
  { length: itemCount },
  (_, index) => `Item ${index + 1}`,
);

interface ControlledItem {
  id: string;
  label: string;
  rev?: number;
}

const controlledItems: ControlledItem[] = Array.from(
  { length: itemCount },
  (_, index) => {
    const number = index + 1;
    return { id: `item-${number}`, label: `Item ${number}` };
  },
);

function CompositeFixture() {
  return (
    <Ariakit.CompositeProvider orientation="horizontal">
      <Ariakit.Composite aria-label="Composite items" className="composite">
        {items.map((item) => (
          <Ariakit.CompositeItem key={item} className="item">
            {item}
          </Ariakit.CompositeItem>
        ))}
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

function ControlledCompositeFixture() {
  const [items, setItems] = useState(controlledItems);
  const [updates, setUpdates] = useState(0);
  const composite = Ariakit.useCompositeStore({
    items,
    setItems,
    orientation: "horizontal",
  });

  const updateItems = () => {
    const rev = updates + 1;
    setItems((items) => items.map((item) => ({ ...item, rev })));
    setUpdates(rev);
  };

  return (
    <>
      <Ariakit.Button className="button" onClick={updateItems}>
        Update items
      </Ariakit.Button>
      <output aria-label="Updates">{updates}</output>
      <Ariakit.Composite
        store={composite}
        aria-label="Controlled composite items"
        className="composite"
      >
        {items.map((item) => (
          <Ariakit.CompositeItem key={item.id} id={item.id} className="item">
            {item.label}
          </Ariakit.CompositeItem>
        ))}
      </Ariakit.Composite>
    </>
  );
}

export default function Example() {
  const [mounted, setMounted] = useState(false);
  const [controlledMounted, setControlledMounted] = useState(false);
  return (
    <div className="root">
      <Ariakit.Button className="button" onClick={() => setMounted(true)}>
        Mount composite
      </Ariakit.Button>
      <Ariakit.Button
        className="button"
        onClick={() => setControlledMounted(true)}
      >
        Mount controlled composite
      </Ariakit.Button>
      {mounted ? <CompositeFixture /> : null}
      {controlledMounted ? <ControlledCompositeFixture /> : null}
    </div>
  );
}
