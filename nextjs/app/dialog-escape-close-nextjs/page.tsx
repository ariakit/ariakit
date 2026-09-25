"use client";

import * as Ariakit from "@ariakit/react";

const fruits = ["Apple", "Banana", "Orange"];

const popupStyle = {
  background: "white",
  border: "1px solid gray",
  padding: 8,
};

const dialogStyle = {
  ...popupStyle,
  position: "fixed",
  top: 24,
  left: 24,
} as const;

function FruitCombobox({ label }: { label: string }) {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.ComboboxLabel>{label}</Ariakit.ComboboxLabel>
      <Ariakit.Combobox />
      <Ariakit.ComboboxPopover portal style={popupStyle}>
        {fruits.map((value) => (
          <Ariakit.ComboboxItem key={value} value={value} />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

// Next.js renders React into the document, so React handles key presses outside
// portals before the Escape listeners that Dialog adds to the document. The
// non-modal popover has no portal, so its combobox popover can close before the
// popover sees the key press in those listeners.
export default function Page() {
  return (
    <div style={{ display: "grid", gap: 24, justifyItems: "start" }}>
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Open order</Ariakit.DialogDisclosure>
        <Ariakit.Dialog style={dialogStyle}>
          <Ariakit.DialogHeading>Order</Ariakit.DialogHeading>
          <FruitCombobox label="Topping" />
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      {/* A non-modal popover renders without a portal by default. */}
      <Ariakit.PopoverProvider>
        <Ariakit.PopoverDisclosure>Filters</Ariakit.PopoverDisclosure>
        <Ariakit.Popover style={popupStyle}>
          <Ariakit.PopoverHeading>Filters</Ariakit.PopoverHeading>
          <FruitCombobox label="Fruit" />
        </Ariakit.Popover>
      </Ariakit.PopoverProvider>
    </div>
  );
}
