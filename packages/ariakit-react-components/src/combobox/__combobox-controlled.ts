import type { ComboboxStore } from "@ariakit/components/combobox/combobox-store";

const controlledValueStoreCounts = new WeakMap<ComboboxStore, number>();

export function markComboboxValueControlled(store: ComboboxStore) {
  const count = controlledValueStoreCounts.get(store) ?? 0;
  controlledValueStoreCounts.set(store, count + 1);
  return () => {
    const count = controlledValueStoreCounts.get(store) ?? 0;
    if (count > 1) {
      controlledValueStoreCounts.set(store, count - 1);
    } else {
      controlledValueStoreCounts.delete(store);
    }
  };
}

export function isComboboxValueControlled(store: ComboboxStore) {
  return controlledValueStoreCounts.has(store);
}
