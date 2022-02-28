import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import { noop } from "ariakit-utils/misc";
import { createStoreContext } from "ariakit-utils/store";
import { Item } from "ariakit/collection/__utils";
import { CollectionState } from "../collection/collection-state";
import { TreeState } from "./tree-state";

export type CollectionTreeItem = CollectionState["items"][number] & {
  id: string;
  groupId?: string | null;
  expanded?: boolean;
  level?: number;
  visible?: boolean;
};

export const TreeContext = createStoreContext<TreeState>();

export const TreeGroupIdContext = createContext<string | undefined>(undefined);
export const TreeItemIdContext = createContext<string | undefined>(undefined);
export const TreeItemsSyncContext = createContext<
  SyncMapStore<CollectionTreeItem> | undefined
>(undefined);

type ItemWithId = Item & { id?: string };

export function useSyncMapStore<T extends ItemWithId>(): SyncMapStore<T> {
  const storeRef = useRef<{ [key: string]: T }>({});

  const setItems = useCallback((items) => {
    for (const key in items) {
      // this check can be safely omitted in modern JS engines
      delete items[key];
    }
  }, []);

  const registerItem = useCallback((item: T) => {
    if (!item.id) return noop;
    storeRef.current[item.id] = item;

    const unregisterItem = () => {
      if (!item.id || !storeRef.current[item.id]) return;
      delete storeRef.current[item.id];
    };
    return unregisterItem;
  }, []);

  return useMemo(
    () => ({
      items: storeRef.current,
      setItems,
      registerItem,
    }),
    []
  );
}

export type SyncMapStore<T extends Item> = Omit<CollectionState<T>, "items"> & {
  items: { [key: string]: T };
  registerItem: CollectionState<T>["registerItem"];
};

export function useTreeItemFromCollection(state?: TreeState, id?: string) {
  const { items: syncTreeItems } = useContext(TreeItemsSyncContext) || {};

  const treeItem = useMemo(() => {
    return state?.treeItems.items.find((t) => t.id === id);
  }, [state]);

  const treeItemFromContext = id ? syncTreeItems?.[id] : undefined;
  return treeItem || treeItemFromContext;
}
