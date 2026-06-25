import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

const itemCount = 400;
const items = Array.from(
  { length: itemCount },
  (_, index) => `Item ${index + 1}`,
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

export default function Example() {
  const [mounted, setMounted] = useState(false);
  return (
    <div className="root">
      <Ariakit.Button className="button" onClick={() => setMounted(true)}>
        Mount composite
      </Ariakit.Button>
      {mounted ? <CompositeFixture /> : null}
    </div>
  );
}
