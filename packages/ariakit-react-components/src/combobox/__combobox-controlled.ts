import { hasOwnProperty } from "@ariakit/utils";

interface ValueStore {
  getState(): { value?: unknown };
}

const controlledValueStoreCounts = new WeakMap<ValueStore, number>();
const valueStoreConnections = new WeakMap<
  ValueStore,
  Map<ValueStore, number>
>();

function addValueStoreConnection(store: ValueStore, target: ValueStore) {
  let connections = valueStoreConnections.get(store);
  if (!connections) {
    connections = new Map();
    valueStoreConnections.set(store, connections);
  }
  const count = connections.get(target) ?? 0;
  connections.set(target, count + 1);
}

function removeValueStoreConnection(store: ValueStore, target: ValueStore) {
  const connections = valueStoreConnections.get(store);
  if (!connections) return;
  const count = connections.get(target) ?? 0;
  if (count <= 1) {
    connections.delete(target);
  } else {
    connections.set(target, count - 1);
  }
  if (!connections.size) {
    valueStoreConnections.delete(store);
  }
}

export function markComboboxValueControlled(store: ValueStore) {
  const count = controlledValueStoreCounts.get(store) ?? 0;
  controlledValueStoreCounts.set(store, count + 1);
  return () => {
    const count = controlledValueStoreCounts.get(store) ?? 0;
    if (count <= 1) {
      controlledValueStoreCounts.delete(store);
      return;
    }
    controlledValueStoreCounts.set(store, count - 1);
  };
}

export function markComboboxValueSource(
  store: ValueStore,
  source?: ValueStore | null,
) {
  if (!source || source === store) return;
  if (!hasOwnProperty(source.getState(), "value")) return;
  addValueStoreConnection(store, source);
  addValueStoreConnection(source, store);
  return () => {
    removeValueStoreConnection(store, source);
    removeValueStoreConnection(source, store);
  };
}

export function isComboboxValueControlled(
  store: ValueStore,
  visited = new Set<ValueStore>(),
): boolean {
  if (controlledValueStoreCounts.has(store)) return true;
  if (visited.has(store)) return false;
  visited.add(store);
  const connections = valueStoreConnections.get(store);
  if (!connections) return false;
  for (const target of connections.keys()) {
    if (isComboboxValueControlled(target, visited)) return true;
  }
  return false;
}
