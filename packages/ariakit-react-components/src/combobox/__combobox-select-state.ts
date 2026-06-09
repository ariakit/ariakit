import { useStoreState } from "@ariakit/react-store";
import { useForceUpdate, useSafeLayoutEffect } from "@ariakit/react-utils";
import type { ComboboxStore } from "./combobox-store.ts";

interface ComboboxSelectState {
  selectElement: HTMLElement | null;
  labelElement: HTMLElement | null;
  listeners: Set<() => void>;
}

const states = new WeakMap<ComboboxStore, ComboboxSelectState>();

function createComboboxSelectState(): ComboboxSelectState {
  return {
    selectElement: null,
    labelElement: null,
    listeners: new Set(),
  };
}

function getComboboxSelectState(store: ComboboxStore) {
  let state = states.get(store);
  if (!state) {
    state = createComboboxSelectState();
    states.set(store, state);
  }
  return state;
}

function notifyComboboxSelectState(state: ComboboxSelectState) {
  for (const listener of state.listeners) listener();
}

function useComboboxSelectState(store: ComboboxStore | null) {
  const [, forceUpdate] = useForceUpdate();

  useSafeLayoutEffect(() => {
    if (!store) return;
    const state = getComboboxSelectState(store);
    state.listeners.add(forceUpdate);
    return () => {
      state.listeners.delete(forceUpdate);
    };
  }, [forceUpdate, store]);

  if (!store) return null;
  return getComboboxSelectState(store);
}

export function setComboboxSelectElement(
  store: ComboboxStore,
  element: HTMLElement,
) {
  const state = getComboboxSelectState(store);
  if (state.selectElement === element) return;
  state.selectElement = element;
  notifyComboboxSelectState(state);
}

export function removeComboboxSelectElement(
  store: ComboboxStore,
  element: HTMLElement,
) {
  const state = getComboboxSelectState(store);
  if (state.selectElement !== element) return;
  state.selectElement = null;
  notifyComboboxSelectState(state);
}

export function getComboboxSelectElement(store: ComboboxStore) {
  return getComboboxSelectState(store).selectElement;
}

export function useComboboxSelectElement(store: ComboboxStore | null) {
  const state = useComboboxSelectState(store);
  const disclosureElement = useStoreState(store, "disclosureElement");
  const selectElement = state?.selectElement;
  if (disclosureElement !== selectElement) return null;
  return selectElement;
}

export function setComboboxSelectLabelElement(
  store: ComboboxStore,
  element: HTMLElement,
) {
  const state = getComboboxSelectState(store);
  if (state.labelElement === element) return;
  state.labelElement = element;
  notifyComboboxSelectState(state);
}

export function removeComboboxSelectLabelElement(
  store: ComboboxStore,
  element: HTMLElement,
) {
  const state = getComboboxSelectState(store);
  if (state.labelElement !== element) return;
  state.labelElement = null;
  notifyComboboxSelectState(state);
}

export function useComboboxSelectLabelElement(store: ComboboxStore | null) {
  const state = useComboboxSelectState(store);
  return state?.labelElement ?? null;
}
