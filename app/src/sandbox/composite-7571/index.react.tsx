import * as Ariakit from "@ariakit/react";
import { createStore } from "@ariakit/store";
import { useState } from "react";

function SharedSelection() {
  const [selection] = useState(() => createStore({ activeId: null }));
  const first = Ariakit.useCompositeStore({ store: selection });
  const second = Ariakit.useCompositeStore({ store: selection });
  return (
    <section>
      <Ariakit.Button onClick={() => first.move(null)}>
        Focus first palette
      </Ariakit.Button>
      <Ariakit.Button onClick={() => second.move(null)}>
        Focus second palette
      </Ariakit.Button>
      <Ariakit.Composite
        store={first}
        role="toolbar"
        aria-label="First palette"
      >
        <Ariakit.CompositeItem>Red</Ariakit.CompositeItem>
      </Ariakit.Composite>
      <Ariakit.Composite
        store={second}
        role="toolbar"
        aria-label="Second palette"
      >
        <Ariakit.CompositeItem>Blue</Ariakit.CompositeItem>
      </Ariakit.Composite>
    </section>
  );
}

function SharedMoveCount() {
  const [moveCount] = useState(() => createStore({ moves: 0 }));
  const palette = Ariakit.useCompositeStore({ store: moveCount });
  const moves = Ariakit.useStoreState(moveCount, "moves");
  return (
    <section>
      <Ariakit.Button onClick={() => palette.move("green")}>
        Focus green
      </Ariakit.Button>
      <Ariakit.Composite
        store={palette}
        role="toolbar"
        aria-label="Counted palette"
      >
        <Ariakit.CompositeItem id="green">Green</Ariakit.CompositeItem>
      </Ariakit.Composite>
      <output>Moves: {moves}</output>
    </section>
  );
}

export default function Example() {
  const [sharedState] = useState(() =>
    createStore<{ activeId: string | null; moves: number }>({
      activeId: null,
      moves: 0,
    }),
  );
  // This store supplies move() for the controls. The provider receives
  // sharedState directly to exercise a source without composite methods.
  // https://github.com/ariakit/ariakit/pull/7572#discussion_r4067006099
  const first = Ariakit.useCompositeStore({ store: sharedState });
  const second = Ariakit.useCompositeStore();
  const [secondDocument, setSecondDocument] = useState(false);
  const [open, setOpen] = useState(true);
  const store = secondDocument ? second : first;

  return (
    <main>
      <Ariakit.Button onClick={() => setOpen(!open)}>
        {open ? "Hide toolbar" : "Show toolbar"}
      </Ariakit.Button>
      <Ariakit.Button onClick={() => store.move("italic")}>
        Focus italic
      </Ariakit.Button>
      <Ariakit.Button onClick={() => store.move(null)}>
        Focus toolbar
      </Ariakit.Button>
      <Ariakit.Button onClick={() => store.setActiveId("bold")}>
        Select bold
      </Ariakit.Button>
      <Ariakit.Button onClick={() => store.setActiveId("italic")}>
        Select italic
      </Ariakit.Button>
      <Ariakit.Button onClick={() => second.move("bold")}>
        Focus bold in second document
      </Ariakit.Button>
      <Ariakit.Button onClick={() => setSecondDocument(!secondDocument)}>
        {secondDocument ? "Use first document" : "Use second document"}
      </Ariakit.Button>
      {open && (
        <Ariakit.CompositeProvider
          store={secondDocument ? second : sharedState}
        >
          <Ariakit.Composite role="toolbar" aria-label="Formatting">
            <Ariakit.CompositeItem id="bold">Bold</Ariakit.CompositeItem>
            <Ariakit.CompositeItem id="italic">Italic</Ariakit.CompositeItem>
          </Ariakit.Composite>
        </Ariakit.CompositeProvider>
      )}
      <SharedSelection />
      <SharedMoveCount />
    </main>
  );
}
