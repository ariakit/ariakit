const controlledValues = new WeakMap<object, () => boolean>();

export function markComboboxValueControlled(
  store: object,
  isControlled: () => boolean,
) {
  controlledValues.set(store, isControlled);
  return () => {
    if (controlledValues.get(store) !== isControlled) return;
    controlledValues.delete(store);
  };
}

export function isComboboxValueControlled(store?: object | null) {
  if (!store) return false;
  return controlledValues.get(store)?.() ?? false;
}
