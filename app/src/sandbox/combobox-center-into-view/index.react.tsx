import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
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

type GeometryLayout =
  | "hidden-overflow"
  | "horizontal-wrapper"
  | "nested-vertical"
  | "padded"
  | "scaled"
  | "translated-item";

interface GeometryFixtureProps {
  label: string;
  layout: GeometryLayout;
}

const geometryLabels = {
  "hidden-overflow": "Hidden overflow fruit",
  "horizontal-wrapper": "Horizontal wrapper fruit",
  "nested-vertical": "Nested vertical fruit",
  padded: "Padded filterable fruit",
  scaled: "Scaled filterable fruit",
  "translated-item": "Translated item fruit",
} satisfies Record<GeometryLayout, string>;

function GeometryFixture({ label, layout }: GeometryFixtureProps) {
  const padded = layout === "padded";
  const hiddenOverflow = layout === "hidden-overflow";
  const items = fruits.map((fruit) => {
    if (layout === "translated-item" && fruit === "Mango") {
      return (
        <div
          key={fruit}
          data-testid="translated-item-wrapper"
          style={{ transform: "translateY(100px)" }}
        >
          <Ariakit.ComboboxItem
            value={fruit}
            style={{ display: "block", padding: "4px 8px" }}
          />
        </div>
      );
    }
    return (
      <Ariakit.ComboboxItem
        key={fruit}
        value={fruit}
        style={{ display: "block", padding: "4px 8px" }}
      />
    );
  });
  return (
    <Ariakit.ComboboxProvider defaultSelectedValue="Mango" virtualFocus={false}>
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block" }} />
      <Ariakit.ComboboxPopover
        gutter={4}
        sameWidth
        style={{
          background: "white",
          border: "1px solid gray",
          borderBottomWidth: layout === "scaled" ? 7 : undefined,
          borderTopWidth: layout === "scaled" ? 3 : undefined,
          maxHeight: 120,
          minWidth: hiddenOverflow ? 160 : undefined,
          overflow: hiddenOverflow ? "hidden" : "auto",
          overflowAnchor: layout === "translated-item" ? "none" : undefined,
          scrollPaddingBottom: padded ? 8 : undefined,
          scrollPaddingTop: padded ? 48 : undefined,
          transform: layout === "scaled" ? "scale(0.95)" : undefined,
          transformOrigin: layout === "scaled" ? "top left" : undefined,
        }}
      >
        <Ariakit.ComboboxInput
          aria-label={`Search ${label}`}
          style={
            padded
              ? {
                  background: "white",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }
              : undefined
          }
        />
        {layout === "horizontal-wrapper" ? (
          <div data-testid="horizontal-wrapper" style={{ overflowX: "auto" }}>
            <div style={{ width: 1000 }}>{items}</div>
          </div>
        ) : layout === "nested-vertical" ? (
          <>
            <div style={{ height: 160 }} />
            <div
              data-testid="nested-vertical-scroll"
              style={{ height: 80, overflowY: "auto" }}
            >
              {items}
            </div>
            <div style={{ height: 160 }} />
          </>
        ) : hiddenOverflow ? (
          <div style={{ marginLeft: 320, width: 120 }}>{items}</div>
        ) : (
          items
        )}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

function GeometryCases() {
  const [layout, setLayout] = useState<GeometryLayout>("scaled");
  return (
    <>
      <label>
        Geometry case
        <select
          value={layout}
          onChange={(event) =>
            setLayout(event.currentTarget.value as GeometryLayout)
          }
        >
          {Object.entries(geometryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <GeometryFixture label={geometryLabels[layout]} layout={layout} />
    </>
  );
}

interface SelectOnlyFixtureProps {
  label: string;
  unmountOnHide?: boolean;
  virtualFocus?: boolean;
}

// A ComboboxSelect with no ComboboxInput. The selected item starts inside the
// scrollport but below its center, so opening has to scroll down to center it
// and a visibility-conditional pass would leave it where it is.
function SelectOnlyFixture({
  label,
  unmountOnHide,
  virtualFocus,
}: SelectOnlyFixtureProps) {
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue="Cherry"
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block" }} />
      <Ariakit.ComboboxPopover
        unmountOnHide={unmountOnHide}
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
        {fruits.map((fruit) => (
          <Ariakit.ComboboxItem
            key={fruit}
            value={fruit}
            style={{
              boxSizing: "border-box",
              display: "block",
              height: 24,
              padding: "4px 8px",
            }}
          />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

interface ScrollablePanelProps {
  children: ReactNode;
  testId: string;
}

function ScrollablePanel({ children, testId }: ScrollablePanelProps) {
  const setPanel = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;
    element.scrollTop = 313;
  }, []);
  return (
    <div
      ref={setPanel}
      data-testid={testId}
      style={{ height: 260, overflow: "auto" }}
    >
      <div style={{ height: 400 }} />
      {children}
      <div style={{ height: 400 }} />
    </div>
  );
}

function ScrollablePanelFixture() {
  return (
    <ScrollablePanel testId="combobox-select-scroll-panel">
      <GeometryFixture label="Panel fruit" layout="scaled" />
    </ScrollablePanel>
  );
}

function IframePanelFixture() {
  const [frameBody, setFrameBody] = useState<HTMLElement | null>(null);
  const setFrame = useCallback((frame: HTMLIFrameElement | null) => {
    const body = frame?.contentDocument?.body;
    if (!body) {
      setFrameBody(null);
      return;
    }
    body.style.margin = "0";
    setFrameBody(body);
  }, []);
  return (
    <ScrollablePanel testId="combobox-select-iframe-panel">
      <iframe
        ref={setFrame}
        title="Combobox select frame"
        style={{ border: 0, display: "block", height: 220, width: "100%" }}
      />
      {frameBody
        ? createPortal(
            <div style={{ minHeight: 220 }}>
              <GeometryFixture label="Iframe fruit" layout="scaled" />
            </div>,
            frameBody,
          )
        : null}
    </ScrollablePanel>
  );
}

function SlottedComboboxFixture() {
  const store = Ariakit.useComboboxStore({
    defaultSelectedValue: "Mango",
    virtualFocus: false,
  });
  const mounted = Ariakit.useStoreState(store, "mounted");
  const [hostElement, setHostElement] = useState<HTMLDivElement | null>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const setHost = useCallback((host: HTMLDivElement | null) => {
    setHostElement(host);
    setShadowRoot(
      host ? host.shadowRoot || host.attachShadow({ mode: "open" }) : null,
    );
  }, []);
  return (
    <Ariakit.ComboboxProvider store={store}>
      <Ariakit.ComboboxSelectLabel>Slotted fruit</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block" }} />
      <Ariakit.ComboboxInput aria-label="Search Slotted fruit" />
      <div ref={setHost} />
      {shadowRoot
        ? createPortal(
            <Ariakit.ComboboxPopover
              gutter={4}
              sameWidth
              style={{
                background: "white",
                border: "1px solid gray",
                maxHeight: 120,
                overflow: "auto",
              }}
            >
              <slot />
            </Ariakit.ComboboxPopover>,
            shadowRoot,
          )
        : null}
      {hostElement && mounted
        ? createPortal(
            <>
              {fruits.map((fruit) => (
                <Ariakit.ComboboxItem
                  key={fruit}
                  value={fruit}
                  style={{ display: "block", padding: "4px 8px" }}
                />
              ))}
            </>,
            hostElement,
          )
        : null}
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <>
      <ScrollablePanelFixture />
      <div style={{ marginTop: 200 }}>
        <IframePanelFixture />
      </div>
      <div style={{ marginTop: 200 }}>
        <ScrollablePanel testId="combobox-select-shadow-panel">
          <SlottedComboboxFixture />
        </ScrollablePanel>
      </div>
      <div style={{ marginTop: 200 }}>
        <GeometryCases />
      </div>
      <div style={{ marginTop: 200 }}>
        <SelectOnlyFixture label="Persistent select-only fruit" />
      </div>
      <div style={{ marginTop: 200 }}>
        <SelectOnlyFixture label="Unmounted select-only fruit" unmountOnHide />
      </div>
      <div style={{ marginTop: 200 }}>
        <SelectOnlyFixture
          label="Real focus select-only fruit"
          virtualFocus={false}
        />
      </div>
    </>
  );
}
