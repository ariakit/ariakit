import * as Ariakit from "@ariakit/react";
import { SelectItem } from "@ariakit/react-components/select/select-item-offscreen";
import type { KeyboardEvent } from "react";

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

const outOfStock = ["Papaya"];

function isTypeaheadKey(event: KeyboardEvent<HTMLElement>) {
  if (event.ctrlKey) return false;
  if (event.altKey) return false;
  if (event.metaKey) return false;
  if (event.key === " ") return true;
  if (event.key.length !== 1) return false;
  return /^[\p{Letter}\p{Number}]$/u.test(event.key);
}

function isDisabledItem(item: HTMLElement) {
  if (item.getAttribute("aria-disabled") === "true") return true;
  if ("disabled" in item && item.disabled) return true;
  return false;
}

export default function Example() {
  const select = Ariakit.useSelectStore({ defaultValue: "Apple" });

  const onKeyDownCapture = (event: KeyboardEvent<HTMLElement>) => {
    if (!isTypeaheadKey(event)) return;
    const contentElement = select.getState().contentElement;
    if (!contentElement) return;
    const offscreenItems = contentElement.querySelectorAll<HTMLElement>(
      "[data-offscreen-id]",
    );
    for (const item of offscreenItems) {
      if (!isDisabledItem(item)) continue;
      const offscreenId = item.getAttribute("data-offscreen-id");
      if (!offscreenId) continue;
      // TODO: Remove this repro-preserving workaround once
      // https://github.com/ariakit/ariakit/issues/6347 is fixed.
      item.removeAttribute("data-offscreen-id");
      queueMicrotask(() => {
        item.setAttribute("data-offscreen-id", offscreenId);
      });
    }
  };

  return (
    <>
      <Ariakit.SelectLabel store={select}>Fruit</Ariakit.SelectLabel>
      <Ariakit.Select
        store={select}
        onKeyDownCapture={onKeyDownCapture}
        style={{ display: "block" }}
      />
      <Ariakit.SelectPopover
        store={select}
        gutter={4}
        sameWidth
        onKeyDownCapture={onKeyDownCapture}
        style={{
          background: "white",
          border: "1px solid gray",
          maxHeight: 120,
          overflow: "auto",
        }}
      >
        {fruits.map((fruit) => (
          <SelectItem
            store={select}
            key={fruit}
            value={fruit}
            disabled={outOfStock.includes(fruit)}
            offscreenMode="passive"
            style={{ display: "block", padding: "4px 8px" }}
          />
        ))}
      </Ariakit.SelectPopover>
    </>
  );
}
