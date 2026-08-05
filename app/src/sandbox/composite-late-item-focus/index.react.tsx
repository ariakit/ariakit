import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const store = Ariakit.useCompositeStore();
  const scrollStore = Ariakit.useCompositeStore({
    defaultActiveId: "late-scroll",
    virtualFocus: false,
  });
  const autoFocusScrollStore = Ariakit.useCompositeStore({
    defaultActiveId: "autofocus-scroll",
    virtualFocus: true,
  });
  const virtualStore = Ariakit.useCompositeStore({
    defaultActiveId: "virtual-late",
    virtualFocus: true,
  });
  const [showLateItem, setShowLateItem] = useState(false);
  const [showLateScrollItem, setShowLateScrollItem] = useState(false);
  const [showVirtualLateItem, setShowVirtualLateItem] = useState(false);

  return (
    <>
      <Ariakit.Composite aria-label="Actions" store={store}>
        <Ariakit.CompositeItem
          id="first"
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown") return;
            event.preventDefault();
            const activeId = store.getState().activeId;
            store.move(activeId === "late" ? "later" : "late");
          }}
        >
          First
        </Ariakit.CompositeItem>
        {showLateItem && (
          <>
            <Ariakit.CompositeItem id="late">Late</Ariakit.CompositeItem>
            <Ariakit.CompositeItem id="later">Later</Ariakit.CompositeItem>
          </>
        )}
      </Ariakit.Composite>
      <button type="button" tabIndex={0} onClick={() => setShowLateItem(true)}>
        Mount late items
      </button>
      <Ariakit.Composite
        aria-label="Scroll actions"
        role="listbox"
        store={scrollStore}
        style={{ height: 80, overflow: "auto" }}
        tabIndex={0}
      >
        <div style={{ height: 200 }} />
        {showLateScrollItem && (
          <Ariakit.CompositeItem data-autofocus id="late-scroll" role="option">
            Late scroll item
          </Ariakit.CompositeItem>
        )}
      </Ariakit.Composite>
      <button
        type="button"
        tabIndex={0}
        onClick={() => setShowLateScrollItem(true)}
      >
        Mount late scroll item
      </button>
      <Ariakit.Composite
        aria-label="Autofocus scroll actions"
        role="listbox"
        store={autoFocusScrollStore}
        style={{ height: 80, overflow: "auto" }}
        tabIndex={0}
      >
        <div style={{ height: 200 }} />
        <Ariakit.CompositeItem autoFocus id="autofocus-scroll" role="option">
          Autofocus scroll item
        </Ariakit.CompositeItem>
      </Ariakit.Composite>
      {/* Focusing a virtual focus composite schedules focus on its active item.
      When that item hasn't registered yet, the schedule outlives the focus that
      created it, so it has to be discarded once the user moves on. */}
      <Ariakit.Composite
        aria-label="Virtual actions"
        role="listbox"
        store={virtualStore}
        tabIndex={0}
      >
        {showVirtualLateItem && (
          <Ariakit.CompositeItem id="virtual-late" role="option">
            Virtual late item
          </Ariakit.CompositeItem>
        )}
      </Ariakit.Composite>
      <button
        type="button"
        tabIndex={0}
        onClick={() => setShowVirtualLateItem(true)}
      >
        Mount virtual late item
      </button>
    </>
  );
}
