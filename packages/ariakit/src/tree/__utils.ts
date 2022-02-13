import { createContext, useMemo } from "react";
import { createStoreContext } from "ariakit-utils/store";
import { TreeState } from "./tree-state";

export const TreeContext = createStoreContext<TreeState>();

export const TreeGroupIdContext = createContext<string | undefined>(undefined);
export const TreeItemIdContext = createContext<string | undefined>(undefined);

export function useTreeGroupItem(state?: TreeState, id?: string) {
  const treeGroup = useMemo(() => {
    return state?.treeGroups.items.find((t) => t.id === id);
  }, [state]);

  return treeGroup;
}
