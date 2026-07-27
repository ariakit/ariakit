import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";

const items = Array.from({ length: 30 }, (_, index) => `Item ${index + 1}`);
const selectedValue = "Item 24";

interface FixtureProps {
  label: string;
  lateItems?: boolean;
}

function Fixture({ label, lateItems }: FixtureProps) {
  const [open, setOpen] = useState(false);
  const [showLateItems, setShowLateItems] = useState(false);

  useEffect(() => {
    if (!lateItems) return;
    if (!open) {
      setShowLateItems(false);
      return;
    }
    const timeout = window.setTimeout(() => setShowLateItems(true), 750);
    return () => window.clearTimeout(timeout);
  }, [lateItems, open]);

  const renderedItems = lateItems && !showLateItems ? items.slice(0, 4) : items;

  return (
    <Ariakit.ComboboxProvider
      setOpen={setOpen}
      defaultSelectedValue={selectedValue}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block" }} />
      <Ariakit.ComboboxPopover
        unmountOnHide
        gutter={4}
        sameWidth
        aria-label={`${label} options`}
        style={{
          background: "white",
          border: "1px solid gray",
          maxHeight: 120,
          overflow: "auto",
        }}
      >
        {renderedItems.map((item) => (
          <Ariakit.ComboboxItem
            key={item}
            value={item}
            style={{ display: "block", padding: "4px 8px" }}
          />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <Fixture label="Pointer race" />
      <Fixture label="Late items" lateItems />
    </>
  );
}
