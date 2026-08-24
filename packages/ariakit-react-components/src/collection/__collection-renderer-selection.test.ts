import { createCompositeSelectableStore } from "@ariakit/components/composite/composite-selectable-store";
import type { SelectableEvent } from "@ariakit/components/composite/composite-selectable-store";
import { init } from "@ariakit/store";
import { afterEach, expect, test } from "vitest";
import type {
  CollectionRendererRangeItem,
  CollectionRendererRangeNode,
} from "./__collection-renderer-selection.ts";
import { createCollectionRendererRangeTree } from "./__collection-renderer-selection.ts";

const cleanups = new Set<() => void>();

afterEach(() => {
  for (const cleanup of cleanups) {
    cleanup();
  }
  cleanups.clear();
});

interface RangeNodeOptions {
  anchorId?: string | null;
  element?: Element | null;
  items: readonly CollectionRendererRangeItem[] | null;
  parent?: CollectionRendererRangeNode | null;
}

function createRangeNode(options: RangeNodeOptions) {
  let items = options.items;
  const node: CollectionRendererRangeNode = {
    getAnchorId: () => options.anchorId ?? null,
    getElement: () => options.element ?? null,
    getItems: () => items,
    getParent: () => options.parent ?? null,
  };
  return {
    node,
    setItems(nextItems: readonly CollectionRendererRangeItem[] | null) {
      items = nextItems;
    },
  };
}

function createEvent(shiftKey = false): SelectableEvent {
  return {
    ctrlKey: false,
    detail: 1,
    metaKey: false,
    shiftKey,
  };
}

test("spans sibling renderers in structural preorder", () => {
  const root = createRangeNode({
    items: [
      { id: "group-a", selectable: false },
      { id: "group-b", selectable: false },
    ],
  });
  const groupA = createRangeNode({
    anchorId: "group-a",
    items: [
      { id: "a-1", selectable: true },
      { id: "a-2", selectable: true },
    ],
    parent: root.node,
  });
  const groupB = createRangeNode({
    anchorId: "group-b",
    items: [
      { id: "b-1", selectable: true },
      { id: "b-2", selectable: true },
    ],
    parent: root.node,
  });
  const tree = createCollectionRendererRangeTree(root.node);

  // Registration order can differ from logical order when nested layout
  // effects mount through separate virtualized branches.
  tree.addNode(groupB.node);
  tree.addNode(groupA.node);

  const store = createCompositeSelectableStore({
    defaultItems: ["a-1", "a-2", "b-1", "b-2"].map((id) => ({ id })),
    rangeDelegate: tree.delegate,
    selectableBehavior: "replace",
  });
  cleanups.add(init(store));
  for (const id of ["a-1", "a-2", "b-1", "b-2"]) {
    store.unstable_selection.setOptIn(id, true);
  }

  store.unstable_selection.activate("a-2", createEvent());
  store.unstable_selection.activate("b-1", createEvent(true));
  expect(store.getState().selectedIds).toEqual(["a-2", "b-1"]);

  store.deselectAll();
  store.unstable_selection.activate("b-1", createEvent());
  store.unstable_selection.activate("a-2", createEvent(true));
  expect(store.getState().selectedIds).toEqual(["a-2", "b-1"]);

  store.deselectAll();
  store.selectAll();
  expect(store.getState().selectedIds).toEqual(["a-1", "a-2", "b-1", "b-2"]);
});

test("keeps sibling order when one renderer switches through zero items", () => {
  const root = createRangeNode({
    items: [
      { id: "group-a", selectable: false },
      { id: "group-b", selectable: false },
    ],
  });
  const groupAItems = [
    { id: "a-1", selectable: true },
    { id: "a-2", selectable: true },
  ];
  const groupA = createRangeNode({
    anchorId: "group-a",
    items: groupAItems,
    parent: root.node,
  });
  const groupB = createRangeNode({
    anchorId: "group-b",
    items: [{ id: "b-1", selectable: true }],
    parent: root.node,
  });
  const tree = createCollectionRendererRangeTree(root.node);
  tree.addNode(groupA.node);
  tree.addNode(groupB.node);

  expect(tree.delegate.getOrderedKeys()).toEqual(["a-1", "a-2", "b-1"]);
  groupA.setItems([]);
  expect(tree.delegate.getOrderedKeys()).toEqual(["b-1"]);
  groupA.setItems(groupAItems);
  expect(tree.delegate.getOrderedKeys()).toEqual(["a-1", "a-2", "b-1"]);
});

test("uses live DOM order for renderers at the same anchor", () => {
  const container = document.createElement("div");
  const elementA = document.createElement("div");
  const elementB = document.createElement("div");
  container.append(elementB, elementA);
  document.body.append(container);
  cleanups.add(() => container.remove());

  const root = createRangeNode({
    items: [{ id: "group", selectable: false }],
  });
  const childA = createRangeNode({
    anchorId: "group",
    element: elementA,
    items: [{ id: "a", selectable: true }],
    parent: root.node,
  });
  const childB = createRangeNode({
    anchorId: "group",
    element: elementB,
    items: [{ id: "b", selectable: true }],
    parent: root.node,
  });
  const tree = createCollectionRendererRangeTree(root.node);
  tree.addNode(childA.node);
  tree.addNode(childB.node);

  expect(tree.delegate.getOrderedKeys()).toEqual(["b", "a"]);
  container.insertBefore(elementA, elementB);
  expect(tree.delegate.getOrderedKeys()).toEqual(["a", "b"]);
});

test("replaces embedded child data without duplicating its keys", () => {
  const root = createRangeNode({
    items: [
      {
        id: "group",
        selectable: false,
        items: [
          { id: "item-1", selectable: true },
          { id: "item-2", selectable: true },
        ],
      },
      { id: "tail", selectable: true },
    ],
  });
  const child = createRangeNode({
    anchorId: "group",
    items: [
      { id: "item-1", selectable: true },
      { id: "item-2", selectable: true },
      { id: "item-3", selectable: true },
    ],
    parent: root.node,
  });
  const tree = createCollectionRendererRangeTree(root.node);
  const removeChild = tree.addNode(child.node);

  expect(tree.delegate.getOrderedKeys()).toEqual([
    "item-1",
    "item-2",
    "item-3",
    "tail",
  ]);
  expect(tree.delegate.getKeysInRange("tail", "item-2")).toEqual([
    "item-2",
    "item-3",
    "tail",
  ]);

  removeChild();
  expect(tree.delegate.getOrderedKeys()).toEqual(["item-1", "item-2", "tail"]);
});

test("refuses a partial answer when a registered branch is unreachable", () => {
  const root = createRangeNode({
    items: [
      { id: "first", selectable: true },
      { id: "last", selectable: true },
    ],
  });
  const staleChild = createRangeNode({
    anchorId: "missing-group",
    items: [{ id: "hidden", selectable: true }],
    parent: root.node,
  });
  const tree = createCollectionRendererRangeTree(root.node);
  tree.addNode(staleChild.node);

  expect(tree.delegate.getOrderedKeys()).toBeNull();
  expect(tree.delegate.getKeysInRange("first", "last")).toBeNull();
});

test("keeps order across sparse item arrays", () => {
  const items = new Array<CollectionRendererRangeItem>(3);
  items[0] = { id: "first", selectable: true };
  items[2] = { id: "last", selectable: true };
  const root = createRangeNode({ items });
  const tree = createCollectionRendererRangeTree(root.node);

  expect(tree.delegate.getOrderedKeys()).toEqual(["first", "last"]);
  expect(tree.delegate.getKeysInRange("first", "last")).toEqual([
    "first",
    "last",
  ]);
});

test("locates range endpoints by id and returns selection keys", () => {
  const root = createRangeNode({
    items: [
      { id: "first", selectionKey: "First value", selectable: true },
      { id: "last", selectionKey: "Last value", selectable: true },
    ],
  });
  const tree = createCollectionRendererRangeTree(root.node);

  expect(tree.delegate.getKeysInRange("first", "last")).toEqual([
    "First value",
    "Last value",
  ]);
  expect(tree.delegate.getOrderedKeys()).toEqual(["First value", "Last value"]);
});

test("live opt-ins override item data only while they are registered", () => {
  const root = createRangeNode({
    items: [
      { id: "data-true", selectable: true },
      { id: "data-false", selectable: false },
      { id: "fallback-true", selectable: true },
      { id: "fallback-false", selectable: false },
    ],
  });
  const store = createCompositeSelectableStore({
    defaultItems: [
      { id: "data-true" },
      { id: "data-false" },
      { id: "fallback-true" },
      { id: "fallback-false" },
    ],
  });
  cleanups.add(init(store));
  const tree = createCollectionRendererRangeTree(root.node, (id, fallback) => {
    if (!store.unstable_selection.hasOptIn(id)) return fallback;
    return store.unstable_selection.isOptedIn(id);
  });

  const removeDataTrue = store.unstable_selection.setOptIn("data-true", false);
  const removeDataFalse = store.unstable_selection.setOptIn("data-false", true);
  expect(tree.delegate.getOrderedKeys()).toEqual([
    "data-false",
    "fallback-true",
  ]);

  removeDataTrue();
  removeDataFalse();
  expect(tree.delegate.getOrderedKeys()).toEqual([
    "data-true",
    "fallback-true",
  ]);
});
