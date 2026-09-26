import * as Ariakit from "@ariakit/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Cherry",
  "Clementine",
  "Coconut",
  "Cranberry",
  "Date",
  "Dragon fruit",
  "Durian",
  "Elderberry",
  "Fig",
  "Grape",
  "Grapefruit",
  "Guava",
  "Honeydew",
  "Jackfruit",
  "Kiwi",
  "Kumquat",
  "Lemon",
  "Lime",
  "Lychee",
  "Mango",
  "Melon",
  "Nectarine",
  "Orange",
  "Papaya",
  "Peach",
  "Pear",
  "Pineapple",
  "Plum",
  "Pomegranate",
  "Quince",
  "Raspberry",
  "Strawberry",
  "Watermelon",
];

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

interface FruitSelectProps {
  label: string;
  autoFocusOnShow?: boolean;
}

function FruitSelect({ label, autoFocusOnShow }: FruitSelectProps) {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Lemon">
      <div style={{ display: "flex", gap: 8, marginBlock: 8 }}>
        <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
      </div>
      {/* The popover stays in the shadow root with the rest of the
      component instead of moving to the document body. */}
      <Ariakit.ComboboxPopover
        portal={false}
        autoFocusOnShow={autoFocusOnShow}
        gutter={4}
        style={{
          maxHeight: 200,
          overflow: "auto",
          background: "Canvas",
          border: "1px solid GrayText",
        }}
      >
        {fruits.map((fruit) => (
          <Ariakit.ComboboxItem
            key={fruit}
            value={fruit}
            style={{ display: "block", padding: "4px 8px" }}
          />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <ShadowHost>
      <style>{"[data-active-item] { background: Highlight; }"}</style>
      <FruitSelect label="Fruit" />
      <FruitSelect
        label="Fruit without initial focus"
        autoFocusOnShow={false}
      />
    </ShadowHost>
  );
}
