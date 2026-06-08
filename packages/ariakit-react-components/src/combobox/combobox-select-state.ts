import { useStoreState } from "@ariakit/react-store";
import { useForceUpdate, useSafeLayoutEffect } from "@ariakit/react-utils";
import type { ComboboxStore } from "./combobox-store.ts";

const elements = new WeakSet<HTMLElement>();
const labels = new WeakMap<ComboboxStore, HTMLElement>();
const labelListeners = new WeakMap<ComboboxStore, Set<() => void>>();

function notifyLabelListeners(store: ComboboxStore) {
  const listeners = labelListeners.get(store);
  if (!listeners) return;
  for (const listener of listeners) listener();
}

export function addComboboxSelectElement(element: HTMLElement) {
  elements.add(element);
}

export function removeComboboxSelectElement(element: HTMLElement) {
  elements.delete(element);
}

export function isComboboxSelectElement(
  element: HTMLElement | null | undefined,
) {
  if (!element) return false;
  return elements.has(element);
}

export function useComboboxSelectElement(store: ComboboxStore | null) {
  return useStoreState(store, (state) => {
    const element = state?.disclosureElement;
    if (!isComboboxSelectElement(element)) return null;
    return element;
  });
}

export function setComboboxSelectLabelElement(
  store: ComboboxStore,
  element: HTMLElement,
) {
  labels.set(store, element);
  notifyLabelListeners(store);
}

export function removeComboboxSelectLabelElement(
  store: ComboboxStore,
  element: HTMLElement,
) {
  if (labels.get(store) !== element) return;
  labels.delete(store);
  notifyLabelListeners(store);
}

export function useComboboxSelectLabelElement(store: ComboboxStore | null) {
  const [, forceUpdate] = useForceUpdate();

  useSafeLayoutEffect(() => {
    if (!store) return;
    let listeners = labelListeners.get(store);
    if (!listeners) {
      listeners = new Set();
      labelListeners.set(store, listeners);
    }
    listeners.add(forceUpdate);
    return () => {
      listeners.delete(forceUpdate);
      if (listeners.size) return;
      labelListeners.delete(store);
    };
  }, [forceUpdate, store]);

  if (!store) return null;
  return labels.get(store) ?? null;
}
