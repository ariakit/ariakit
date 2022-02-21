import { useCallback, useMemo, useRef } from "react";
import { useWrapElement } from "ariakit-utils/hooks";
import { useStoreProvider } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { CompositeOptions, useComposite } from "../composite/composite";
import {
  CollectionTreeItem,
  TreeContext,
  TreeItemsSyncContext,
  useSyncMapStore,
} from "./__utils";
import { TreeState } from "./tree-state";

export const useTree = createHook<TreeOptions>(({ state, ...props }) => {
  props = {
    role: "tree",
    ...props,
  };

  const treeItemsSync = useSyncMapStore<CollectionTreeItem>();

  props = useStoreProvider({ state, ...props }, TreeContext);
  props = useComposite({ state, ...props });

  props = useWrapElement(props, (element) => (
    <TreeItemsSyncContext.Provider value={treeItemsSync}>
      {element}
    </TreeItemsSyncContext.Provider>
  ));

  return props;
});

export const Tree = createComponent<TreeOptions>((props) => {
  const htmlProps = useTree(props);
  return createElement("div", htmlProps);
});

export type TreeOptions<T extends As = "div"> = Omit<
  CompositeOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useTreeState` hook.
   */
  state: TreeState;
};

export type TreeProps<T extends As = "div"> = Props<TreeOptions<T>>;
