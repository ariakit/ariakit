import { createContext, useMemo } from "react";
import { createStoreContext } from "ariakit-utils/store";
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
export const TreeItemLevelContext = createContext<number | undefined>(
  undefined
);
export const TreeItemExpandedContext = createContext<boolean | undefined>(
  undefined
);
export const TreeItemVisibleContext = createContext<boolean | undefined>(
  undefined
);

export function useTreeItemFromCollection(state?: TreeState, id?: string) {
  return useMemo(() => {
    return state?.treeItems.items.find((t) => t.id === id);
  }, [state]);
}
