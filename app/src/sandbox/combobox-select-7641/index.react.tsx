import * as Ariakit from "@ariakit/react";
import type { KeyboardEvent, ReactNode } from "react";
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

function getShadowRoot(element: Element) {
  const root = element.getRootNode();
  if (root.nodeType !== root.DOCUMENT_FRAGMENT_NODE) return null;
  return root as ShadowRoot;
}

// TODO: Remove this workaround after the fix for
// https://github.com/ariakit/ariakit/issues/7641 lands. ComboboxSelect doesn't
// see its own focus inside a shadow root, so it neither forwards keys to the
// open popup nor presents the selected item when it reopens with focus. This
// does both from the select's own key handler and the popup's open state.
function useShadowRootSelectWorkaround(store: Ariakit.ComboboxStore) {
  const open = Ariakit.useStoreState(store, "open");

  useEffect(() => {
    if (!open) return;
    const { selectElement, contentElement, activeId } = store.getState();
    if (!selectElement) return;
    if (!contentElement) return;
    if (getShadowRoot(selectElement)?.activeElement !== selectElement) return;
    // Placement resolves asynchronously and can change the popup's size, so
    // this waits a frame before measuring.
    const frame = requestAnimationFrame(() => {
      const item = store.item(activeId)?.element;
      if (!item) return;
      const itemRect = item.getBoundingClientRect();
      const listRect = contentElement.getBoundingClientRect();
      const itemCenter = itemRect.top + itemRect.height / 2;
      const listCenter = listRect.top + listRect.height / 2;
      contentElement.scrollTop += itemCenter - listCenter;
    });
    return () => cancelAnimationFrame(frame);
  }, [open, store]);

  return (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.defaultPrevented) return;
    const { open, activeId } = store.getState();
    if (!open) return;
    const select = event.currentTarget;
    if (getShadowRoot(select)?.activeElement !== select) return;
    const moves: Partial<Record<string, () => string | null | undefined>> = {
      ArrowDown: store.down,
      ArrowUp: store.up,
      Home: store.first,
      End: store.last,
    };
    const getNextId = moves[event.key];
    if (getNextId) {
      event.preventDefault();
      store.move(getNextId());
      return;
    }
    if (event.key === "Escape") {
      const { contentElement } = store.getState();
      if (!contentElement) return;
      event.preventDefault();
      // Closing through the popup's own Escape handling keeps props such as
      // hideOnEscape and resetOnEscape working.
      contentElement.dispatchEvent(
        new window.KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        }),
      );
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      store.item(activeId)?.element?.click();
    }
  };
}

function FruitSelect({ label, autoFocusOnShow }: FruitSelectProps) {
  const store = Ariakit.useComboboxStore({ defaultSelectedValue: "Lemon" });
  const onSelectKeyDown = useShadowRootSelectWorkaround(store);
  return (
    <Ariakit.ComboboxProvider store={store}>
      <div style={{ display: "flex", gap: 8, marginBlock: 8 }}>
        <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect onKeyDown={onSelectKeyDown} />
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
