import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";

// See https://github.com/ariakit/ariakit/issues/6320
//
// In an RTL context, a popover that resolves to a `right` placement writes
// `right: 100%` on its arrow element. Later position updates never clear that
// declaration: they only write `left`, `top`, and the new side. With both
// `left` and `right` set, RTL over-constrained absolute positioning ignores
// `left`, so the stale `right: 100%` pins the arrow to the popover's left
// edge, visually detached from the anchor.
//
// Two user-level triggers change the resolved placement while the popover is
// open:
// 1. Scrolling the container so the anchor nears its right edge, which makes
//    the popover flip above the anchor (browser test).
// 2. Clicking "Show above", which changes the `placement` prop (also covered
//    by the happy-dom test, where layout-driven flips can't happen).
export default function Example() {
  const [placement, setPlacement] = useState<"right" | "top">("right");
  const store = Ariakit.usePopoverStore({ placement });
  const currentPlacement = Ariakit.useStoreState(store, "currentPlacement");

  // TODO: Remove this workaround once
  // https://github.com/ariakit/ariakit/issues/6320 is fixed. Position updates
  // only rewrite the arrow's `left`/`top` and the current side, so the static
  // side written for a previous placement (`right: 100%` here) lingers on the
  // element. Clear the leftover insets whenever the resolved placement
  // changes; the stale property is only ever rewritten while its own side is
  // active, so once per placement change is enough.
  useEffect(() => {
    const { arrowElement } = store.getState();
    if (!arrowElement) return;
    const side = currentPlacement.split("-")[0];
    if (side !== "right") {
      arrowElement.style.removeProperty("right");
    }
    if (side !== "bottom") {
      arrowElement.style.removeProperty("bottom");
    }
  }, [store, currentPlacement]);

  return (
    <div dir="rtl">
      <div
        className="scroller"
        style={{
          width: 600,
          height: 400,
          overflow: "auto",
          border: "1px solid gray",
        }}
      >
        <div style={{ position: "relative", width: 1600, height: 380 }}>
          <Ariakit.PopoverDisclosure
            store={store}
            style={{ position: "absolute", top: 280, right: 450 }}
          >
            Accept invite
          </Ariakit.PopoverDisclosure>
          <Ariakit.Popover
            store={store}
            flip="top bottom"
            style={{
              width: 200,
              padding: 8,
              background: "white",
              color: "black",
              border: "1px solid gray",
            }}
          >
            <Ariakit.PopoverArrow className="arrow" />
            <Ariakit.PopoverHeading>Team meeting</Ariakit.PopoverHeading>
            <p>We are going to discuss the project.</p>
            <button type="button" onClick={() => setPlacement("top")}>
              Show above
            </button>
          </Ariakit.Popover>
        </div>
      </div>
    </div>
  );
}
