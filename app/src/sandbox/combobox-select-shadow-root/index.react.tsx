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

interface SearchableFruitSelectProps {
  label: string;
  /**
   * Keeps the popover in the shadow root with the select instead of moving it
   * to the document body.
   */
  inShadowRoot?: boolean;
}

function SearchableFruitSelect({
  label,
  inShadowRoot,
}: SearchableFruitSelectProps) {
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Lemon">
      <div style={{ display: "flex", gap: 8, marginBlock: 8 }}>
        <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
      </div>
      <Ariakit.ComboboxPopover
        portal={!inShadowRoot}
        autoFocusOnShow={false}
        aria-label={`${label} options`}
        gutter={4}
        style={{
          maxHeight: 200,
          overflow: "auto",
          background: "Canvas",
          border: "1px solid GrayText",
        }}
      >
        <Ariakit.ComboboxInput aria-label={`Search ${label}`} />
        <Ariakit.ComboboxList>
          {fruits.map((fruit) => (
            <Ariakit.ComboboxItem
              key={fruit}
              value={fruit}
              style={{ display: "block", padding: "4px 8px" }}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

interface HeldFruitSelectProps {
  label: string;
  /**
   * Adds a search input to the popup and portals the popup out of the shadow
   * root, so the input, which becomes the composite element, is in the document
   * while the select stays in the shadow tree.
   */
  searchable?: boolean;
}

/**
 * A select whose popup waits for its positioning until a button in the same
 * shadow root releases it, the way a popup waiting for layout to settle does.
 * The popup doesn't hide on outside interaction, so focus can move to that
 * button while the popup keeps its pending scroll.
 */
function HeldFruitSelect({ label, searchable }: HeldFruitSelectProps) {
  const releaseRef = useRef<(() => void) | null>(null);
  const updatePosition = async (props: {
    updatePosition: () => Promise<void>;
  }) => {
    await new Promise<void>((resolve) => {
      releaseRef.current = resolve;
    });
    await props.updatePosition();
  };
  const items = fruits.map((fruit) => (
    <Ariakit.ComboboxItem
      key={fruit}
      value={fruit}
      style={{ display: "block", padding: "4px 8px" }}
    />
  ));
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Lemon">
      <div style={{ display: "flex", gap: 8, marginBlock: 8 }}>
        <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <button
          type="button"
          tabIndex={0}
          onClick={() => {
            releaseRef.current?.();
            releaseRef.current = null;
          }}
        >
          Finish {label} positioning
        </button>
      </div>
      <Ariakit.ComboboxPopover
        portal={!!searchable}
        autoFocusOnShow={false}
        hideOnInteractOutside={false}
        updatePosition={updatePosition}
        aria-label={`${label} options`}
        gutter={4}
        style={{
          maxHeight: 200,
          overflow: "auto",
          background: "Canvas",
          border: "1px solid GrayText",
        }}
      >
        {searchable ? (
          <>
            <Ariakit.ComboboxInput aria-label="Search fruits" />
            <Ariakit.ComboboxList>{items}</Ariakit.ComboboxList>
          </>
        ) : (
          items
        )}
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
      <SearchableFruitSelect label="Searchable fruit" inShadowRoot />
      <SearchableFruitSelect label="Portaled searchable fruit" />
      <HeldFruitSelect label="Held fruit" />
      <HeldFruitSelect label="Held searchable fruit" searchable />
    </ShadowHost>
  );
}
