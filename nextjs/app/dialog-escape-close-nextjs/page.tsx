"use client";

import * as Ariakit from "@ariakit/react";
import { useState } from "react";

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

// A persistent panel elsewhere on the page. It isn't a React ancestor of the
// snack combobox, so only its document listeners see the key press.
function Notice() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <Ariakit.Button onClick={() => setOpen(true)}>Show notice</Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        hideOnInteractOutside={false}
        aria-label="Notice"
        style={popupStyle}
      >
        Orders placed today ship tomorrow.
      </Ariakit.Dialog>
    </div>
  );
}

// The popover mounts only after the notice opens, so the notice ignores the
// copy that Composite dispatches on the active item. Otherwise, the notice
// marks the popover too, and #7647 keeps both open.
// https://github.com/ariakit/ariakit/issues/7647
function SnackCombobox() {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.ComboboxLabel>Snack</Ariakit.ComboboxLabel>
      <Ariakit.Combobox />
      <Ariakit.ComboboxPopover unmountOnHide style={popupStyle}>
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
      <Notice />
      <SnackCombobox />
    </div>
  );
}
