import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

function Formatting({ virtualFocus = false }) {
  const name = virtualFocus ? "Virtual" : "Native";
  const store = Ariakit.useCompositeStore({ virtualFocus });
  const [revision, setRevision] = useState(0);
  const [showBold, setShowBold] = useState(true);
  const [enabled, setEnabled] = useState(true);
  return (
    <section>
      <h2>{name} focus</h2>
      <p>Use arrow keys or hover. F2 refreshes. Delete removes Bold.</p>
      <Ariakit.Composite
        store={store}
        composite={enabled}
        focusable={enabled}
        role="toolbar"
        aria-label={name}
        className="focus-toolbar"
        onKeyDown={(event) => {
          if (event.key === "F2") {
            event.preventDefault();
            setRevision((value) => value + 1);
          }
          if (event.key === "Delete") {
            event.preventDefault();
            setShowBold(false);
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setEnabled(false);
          }
        }}
      >
        {showBold && (
          <Ariakit.CompositeHover
            store={store}
            id={`${name}-bold`}
            render={<Ariakit.CompositeItem store={store} />}
            className="focus-item"
          >
            {name} Bold
          </Ariakit.CompositeHover>
        )}
        <Ariakit.CompositeHover
          store={store}
          id={`${name}-italic`}
          render={<Ariakit.CompositeItem store={store} />}
          className="focus-item"
        >
          {name} Italic
        </Ariakit.CompositeHover>
      </Ariakit.Composite>
      <output>
        {name} revision: {revision}
      </output>
      <Ariakit.Button onClick={() => store.setActiveId(`${name}-bold`)}>
        Remember {name} Bold
      </Ariakit.Button>
    </section>
  );
}

export default function Example() {
  return (
    <main className="focus-demo">
      <h1>Supplemental focus styling</h1>
      <p>Blue means current focus. A dashed border means the active item.</p>
      <Formatting />
      <Formatting virtualFocus />
      <section>
        <h2>Portalled options</h2>
        <Ariakit.ComboboxProvider>
          <Ariakit.ComboboxLabel>Fruit</Ariakit.ComboboxLabel>
          <Ariakit.Combobox />
          <Ariakit.ComboboxPopover portal gutter={4} className="focus-popup">
            <Ariakit.ComboboxItem value="Apple" className="focus-item" />
            <Ariakit.ComboboxItem value="Orange" className="focus-item" />
          </Ariakit.ComboboxPopover>
        </Ariakit.ComboboxProvider>
      </section>
      <Ariakit.Button>Outside</Ariakit.Button>
    </main>
  );
}
