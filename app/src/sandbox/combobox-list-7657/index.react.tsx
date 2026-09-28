import * as Ariakit from "@ariakit/react";
import type { FocusEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const fruits = ["Apple", "Banana", "Cherry", "Grape", "Orange"];

interface ShadowHostProps {
  children: ReactNode;
}

// Renders its children inside an open shadow root, the way a web component that
// hosts a React app does.
function ShadowHost({ children }: ShadowHostProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    setRoot(host.shadowRoot || host.attachShadow({ mode: "open" }));
  }, []);
  return <div ref={hostRef}>{root && createPortal(children, root)}</div>;
}

const listStyle = {
  padding: 16,
  background: "Canvas",
  border: "1px solid GrayText",
};

function Items({ prefix }: { prefix: string }) {
  return fruits.map((fruit) => (
    <Ariakit.ComboboxItem
      key={fruit}
      value={fruit}
      aria-label={`${prefix} ${fruit}`}
      style={{ display: "block", padding: "4px 8px" }}
    />
  ));
}

// TODO: Remove this workaround once
// https://github.com/ariakit/ariakit/issues/7657 is fixed. Inside a shadow
// root, the list can't tell that it holds focus, so it doesn't hand focus back
// to the combobox.
function useReturnFocusToCombobox() {
  const comboboxRef = useRef<HTMLInputElement>(null);
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    comboboxRef.current?.focus();
  };
  return { comboboxRef, onFocus };
}

function PopoverExample() {
  const { comboboxRef, onFocus } = useReturnFocusToCombobox();
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.Combobox
        ref={comboboxRef}
        aria-label="Popover fruit"
        autoSelect
      />
      {/* The popover stays in the shadow root with the rest of the
      component instead of moving to the document body. */}
      <Ariakit.ComboboxPopover
        portal={false}
        aria-label="Popover fruit options"
        onFocus={onFocus}
        style={listStyle}
      >
        <Items prefix="Popover" />
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function ListExample() {
  const { comboboxRef, onFocus } = useReturnFocusToCombobox();
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.Combobox ref={comboboxRef} aria-label="List fruit" autoSelect />
      <Ariakit.ComboboxList
        alwaysVisible
        aria-label="List fruit options"
        onFocus={onFocus}
        style={listStyle}
      >
        <Items prefix="List" />
      </Ariakit.ComboboxList>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <ShadowHost>
      <style>{"[data-active-item] { background: Highlight; }"}</style>
      <PopoverExample />
      <ListExample />
    </ShadowHost>
  );
}
