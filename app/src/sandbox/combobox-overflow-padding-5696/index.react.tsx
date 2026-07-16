import * as Ariakit from "@ariakit/react";
import { useCallback, useReducer, useRef, useState } from "react";
import "./style.css";

// An initially closed popover that stays mounted while hidden and uses the
// default positioning. The overflow padding CSS variable is public API and
// must be exposed on the wrapper even before the popover first opens.
function ClosedPopoverExample() {
  return (
    <Ariakit.PopoverProvider>
      <Ariakit.PopoverDisclosure>Closed popover</Ariakit.PopoverDisclosure>
      <Ariakit.Popover className="closed-popover" overflowPadding={24}>
        Closed popover content
      </Ariakit.Popover>
    </Ariakit.PopoverProvider>
  );
}

export default function Example() {
  const [, rerender] = useReducer((count) => count + 1, 0);
  const positionUpdatesRef = useRef<HTMLOutputElement>(null);
  const positionUpdates = useRef(0);
  const [rightPadding, setRightPadding] = useState(32);
  const updatePosition = useCallback<
    NonNullable<Ariakit.PopoverOptions["updatePosition"]>
  >(async ({ updatePosition }) => {
    positionUpdates.current += 1;
    if (positionUpdatesRef.current) {
      positionUpdatesRef.current.value = `${positionUpdates.current}`;
    }
    await updatePosition();
  }, []);

  return (
    <>
      <ClosedPopoverExample />
      <Ariakit.ComboboxProvider defaultOpen>
        <Ariakit.ComboboxLabel>Favorite fruit</Ariakit.ComboboxLabel>
        <Ariakit.Combobox />
        <button onClick={rerender}>Rerender</button>
        <button onClick={() => setRightPadding(40)}>Change padding</button>
        <Ariakit.ComboboxPopover
          className="popover"
          hideOnInteractOutside={false}
          overflowPadding={
            {
              top: 48,
              right: rightPadding,
              left: 8,
            } satisfies Ariakit.ComboboxPopoverOptions["overflowPadding"]
          }
          updatePosition={updatePosition}
        >
          <Ariakit.ComboboxItem value="Apple" />
          <Ariakit.ComboboxItem value="Orange" />
        </Ariakit.ComboboxPopover>
        <output ref={positionUpdatesRef} aria-label="Position updates">
          0
        </output>
      </Ariakit.ComboboxProvider>
    </>
  );
}
