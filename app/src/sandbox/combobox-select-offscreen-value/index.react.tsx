import * as Ariakit from "@ariakit/react";
import { ComboboxItem } from "@ariakit/react-components/combobox/combobox-item-offscreen";
import { useRef, useState } from "react";

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

interface FixtureProps {
  defaultSelectedValue: string | string[];
  focusTarget?: boolean;
  input?: boolean;
  label: string;
  moveFocusOnOpen?: boolean;
  selectOnMove?: boolean;
  virtualFocus?: boolean;
}

function Fixture({
  defaultSelectedValue,
  focusTarget,
  input,
  label,
  moveFocusOnOpen,
  selectOnMove,
  virtualFocus,
}: FixtureProps) {
  const focusTargetRef = useRef<HTMLDivElement>(null);
  const items = (
    <>
      {fruits.map((fruit) => (
        <ComboboxItem
          key={fruit}
          value={fruit}
          offscreenMode="passive"
          style={{ display: "block", padding: "4px 8px" }}
        />
      ))}
      {/* An item rendered without a value, at the end of the list so it's
      always out of view. */}
      <ComboboxItem
        offscreenMode="passive"
        style={{ display: "block", padding: "4px 8px" }}
      >
        {`No ${label.toLowerCase()}`}
      </ComboboxItem>
    </>
  );
  return (
    <Ariakit.ComboboxProvider
      defaultSelectedValue={defaultSelectedValue}
      selectOnMove={selectOnMove}
      virtualFocus={virtualFocus}
    >
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block" }} />
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
        {input && (
          <Ariakit.ComboboxInput
            aria-label={`Search ${label}`}
            onFocus={() => {
              if (!moveFocusOnOpen) return;
              queueMicrotask(() => focusTargetRef.current?.focus());
            }}
          />
        )}
        {focusTarget && (
          <Ariakit.ComboboxItem
            ref={focusTargetRef}
            style={{ display: "block", padding: "4px 8px" }}
            value="Focus target"
          />
        )}
        {items}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

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

export default function Example() {
  return (
    <>
      <Fixture defaultSelectedValue={[]} label="Fruit" />
      <Fixture defaultSelectedValue={["Apple"]} label="Selected fruit" />
      <Fixture defaultSelectedValue="Apple" label="Single selected fruit" />
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          input
          label="Filterable fruit"
          virtualFocus={false}
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          focusTarget
          input
          label="Focus moving filterable fruit"
          moveFocusOnOpen
          virtualFocus={false}
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          input
          label="Touch filterable fruit"
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <Fixture
          defaultSelectedValue="Watermelon"
          input
          label="Virtual focus fruit"
          selectOnMove
          virtualFocus
        />
      </div>
      <div style={{ marginTop: 200 }}>
        <GeometryCases />
      </div>
    </>
  );
}
