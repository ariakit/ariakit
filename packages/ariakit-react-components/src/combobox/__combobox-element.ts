import { useCallback, useRef } from "react";
import type { ComboboxStore } from "./combobox-store.ts";

type ComboboxElementType = "combobox" | "disclosure";

interface ComboboxElements {
  combobox: Set<ComboboxElementRef>;
  disclosure: Set<ComboboxElementRef>;
}

interface ComboboxElementRef {
  current: HTMLElement | null;
}

const comboboxElements = new WeakMap<ComboboxStore, ComboboxElements>();

function getComboboxElements(store: ComboboxStore) {
  let elements = comboboxElements.get(store);
  if (!elements) {
    elements = {
      combobox: new Set(),
      disclosure: new Set(),
    };
    comboboxElements.set(store, elements);
  }
  return elements;
}

function getLastConnectedElement(elements: Set<ComboboxElementRef>) {
  let connectedElement: HTMLElement | null = null;
  for (const ref of elements) {
    const element = ref.current;
    if (!element?.isConnected) {
      elements.delete(ref);
      continue;
    }
    connectedElement = element;
  }
  return connectedElement;
}

function getDisclosureElement(elements: ComboboxElements) {
  return (
    getLastConnectedElement(elements.disclosure) ||
    getLastConnectedElement(elements.combobox)
  );
}

export function useComboboxElement(
  store: ComboboxStore,
  type: ComboboxElementType,
) {
  const elementRef = useRef<HTMLElement | null>(null);

  return useCallback(
    (element: HTMLElement | null) => {
      const previousElement = elementRef.current;
      elementRef.current = element;

      const elements = getComboboxElements(store);
      const typedElements = elements[type];
      if (element) {
        typedElements.add(elementRef);
      } else {
        typedElements.delete(elementRef);
      }

      if (type === "disclosure" && element) {
        store.setDisclosureElement(element);
        return;
      }

      const currentElement = store.getState().disclosureElement;
      const currentIsCombobox = Array.from(elements.combobox).some(
        (ref) => ref.current === currentElement,
      );
      if (
        currentElement?.isConnected &&
        currentElement !== previousElement &&
        !(type === "disclosure" && currentIsCombobox)
      ) {
        return;
      }

      store.setDisclosureElement(getDisclosureElement(elements));
    },
    [store, type],
  );
}
