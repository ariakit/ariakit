import type { SelectableRangeDelegate } from "@ariakit/components/composite/composite-selectable-store";
import { getDocument, getWindow } from "@ariakit/utils";

export interface CollectionRendererRangeItem {
  id: string;
  selectionKey?: string;
  selectable: boolean;
  items?: readonly CollectionRendererRangeItem[];
}

export interface CollectionRendererRangeNode {
  getAnchorId(): string | null;
  getElement(): Element | null;
  getItems(): readonly CollectionRendererRangeItem[] | null;
  getParent(): CollectionRendererRangeNode | null;
}

export interface CollectionRendererRangeTree {
  addNode(node: CollectionRendererRangeNode): () => void;
  delegate: SelectableRangeDelegate;
}

interface NodeRegistration {
  count: number;
  sequence: number;
}

interface ResolvedRangeItem {
  id: string;
  selectionKey: string;
  selectable: boolean;
}

type ResolveSelectable = (id: string, fallback: boolean) => boolean;
type ResolveSelectionKey = (
  id: string,
  fallbackKey: string,
) => string | null | undefined;

function addRangeItem(
  rangeItems: ResolvedRangeItem[],
  itemIndices: Map<string, number>,
  item: CollectionRendererRangeItem,
) {
  const itemIndex = itemIndices.get(item.id);
  if (itemIndex == null) {
    itemIndices.set(item.id, rangeItems.length);
    rangeItems.push({
      id: item.id,
      selectionKey: item.selectionKey ?? item.id,
      selectable: item.selectable,
    });
    return;
  }
  const rangeItem = rangeItems[itemIndex];
  if (!rangeItem) return;
  if (!item.selectable) return;
  if (rangeItem.selectable) return;
  rangeItems[itemIndex] = {
    ...rangeItem,
    selectionKey: item.selectionKey ?? item.id,
    selectable: true,
  };
}

export function createCollectionRendererRangeTree(
  rootNode: CollectionRendererRangeNode,
  resolveSelectable: ResolveSelectable = (_itemId, fallback) => fallback,
  resolveSelectionKey: ResolveSelectionKey = (_itemId, fallbackKey) =>
    fallbackKey,
): CollectionRendererRangeTree {
  let nextSequence = 0;
  const registrations = new Map<
    CollectionRendererRangeNode,
    NodeRegistration
  >();
  const nodeSequences = new WeakMap<CollectionRendererRangeNode, number>();

  const getChildrenByParent = () => {
    const childrenByParent = new Map<
      CollectionRendererRangeNode,
      Map<
        string | null,
        Array<{ node: CollectionRendererRangeNode; sequence: number }>
      >
    >();
    for (const [node, registration] of registrations) {
      const parentNode = node.getParent();
      if (!parentNode) continue;
      const anchorId = node.getAnchorId();
      const childrenByAnchor = childrenByParent.get(parentNode) ?? new Map();
      const children = childrenByAnchor.get(anchorId) ?? [];
      children.push({ node, sequence: registration.sequence });
      childrenByAnchor.set(anchorId, children);
      childrenByParent.set(parentNode, childrenByAnchor);
    }
    for (const childrenByAnchor of childrenByParent.values()) {
      for (const children of childrenByAnchor.values()) {
        children.sort((child, otherChild) => {
          const element = child.node.getElement();
          const otherElement = otherChild.node.getElement();
          if (!element || !otherElement) {
            return child.sequence - otherChild.sequence;
          }
          if (getDocument(element) !== getDocument(otherElement)) {
            return child.sequence - otherChild.sequence;
          }
          const NodeConstructor = getWindow(element).Node;
          const position = element.compareDocumentPosition(otherElement);
          if (position & NodeConstructor.DOCUMENT_POSITION_DISCONNECTED) {
            return child.sequence - otherChild.sequence;
          }
          if (position & NodeConstructor.DOCUMENT_POSITION_FOLLOWING) return -1;
          if (position & NodeConstructor.DOCUMENT_POSITION_PRECEDING) return 1;
          return child.sequence - otherChild.sequence;
        });
      }
    }
    return childrenByParent;
  };

  const resolveItems = () => {
    const rangeItems: ResolvedRangeItem[] = [];
    const itemIndices = new Map<string, number>();
    const visitedNodes = new Set<CollectionRendererRangeNode>();
    const childrenByParent = getChildrenByParent();

    const getChildren = (
      parentNode: CollectionRendererRangeNode,
      anchorId: string | null,
    ) => {
      const children = childrenByParent.get(parentNode)?.get(anchorId) ?? [];
      return children.map((child) => child.node);
    };

    const appendNode = (node: CollectionRendererRangeNode): boolean => {
      if (visitedNodes.has(node)) return true;
      visitedNodes.add(node);
      const items = node.getItems();
      if (!items) return false;

      const appendItems = (
        currentItems: readonly CollectionRendererRangeItem[],
      ): boolean => {
        for (let index = 0; index < currentItems.length; index += 1) {
          const item = currentItems[index];
          if (!item) continue;
          addRangeItem(rangeItems, itemIndices, item);
          const children = getChildren(node, item.id);
          if (children.length) {
            for (const child of children) {
              if (!appendNode(child)) return false;
            }
            continue;
          }
          if (item.items && !appendItems(item.items)) return false;
        }
        return true;
      };

      if (!appendItems(items)) return false;
      for (const child of getChildren(node, null)) {
        if (!appendNode(child)) return false;
      }
      return true;
    };

    if (!appendNode(rootNode)) return null;
    if (visitedNodes.size !== registrations.size + 1) return null;
    return rangeItems;
  };

  const delegate: SelectableRangeDelegate = {
    getKeysInRange(fromId, toId) {
      const rangeItems = resolveItems();
      if (!rangeItems) return null;
      const fromIndex = rangeItems.findIndex((item) => item.id === fromId);
      const toIndex = rangeItems.findIndex((item) => item.id === toId);
      if (fromIndex < 0 || toIndex < 0) return null;
      const startIndex = Math.min(fromIndex, toIndex);
      const endIndex = Math.max(fromIndex, toIndex);
      return rangeItems
        .slice(startIndex, endIndex + 1)
        .filter((item) => resolveSelectable(item.id, item.selectable))
        .flatMap((item) => {
          const key = resolveSelectionKey(item.id, item.selectionKey);
          return key == null ? [] : [key];
        });
    },
    getOrderedKeys() {
      const rangeItems = resolveItems();
      if (!rangeItems) return null;
      return rangeItems
        .filter((item) => resolveSelectable(item.id, item.selectable))
        .flatMap((item) => {
          const key = resolveSelectionKey(item.id, item.selectionKey);
          return key == null ? [] : [key];
        });
    },
  };

  const addNode = (node: CollectionRendererRangeNode) => {
    if (node === rootNode) return () => {};
    const currentRegistration = registrations.get(node);
    if (currentRegistration) {
      currentRegistration.count += 1;
    } else {
      let sequence = nodeSequences.get(node);
      if (sequence == null) {
        sequence = nextSequence;
        nextSequence += 1;
        nodeSequences.set(node, sequence);
      }
      registrations.set(node, { count: 1, sequence });
    }
    return () => {
      const registration = registrations.get(node);
      if (!registration) return;
      registration.count -= 1;
      if (registration.count) return;
      registrations.delete(node);
    };
  };

  return { addNode, delegate };
}
