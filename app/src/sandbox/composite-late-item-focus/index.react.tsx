import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const store = Ariakit.useCompositeStore();
  const [showLateItem, setShowLateItem] = useState(false);

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
      <button type="button" onClick={() => setShowLateItem(true)}>
        Mount late items
      </button>
    </>
  );
}
