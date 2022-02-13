import { useCallback, useContext, useMemo } from "react";
import { useId, useWrapElement } from "ariakit-utils/hooks";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CollectionItemOptions,
  useCollectionItem,
} from "../collection/collection-item";
import {
  CompositeItemOptions,
  useCompositeItem,
} from "../composite/composite-item";
import {
  TreeContext,
  TreeGroupIdContext,
  TreeItemIdContext,
  useTreeGroupItem,
} from "./__utils";
import { TreeState } from "./tree-state";

export const useTreeItem = createHook<TreeItemOptions>(
  ({ state, shouldRegisterItem = true, getItem: getItemProp, ...props }) => {
    const id = useId(props.id);
    const parentTreeGroupId = useContext(TreeGroupIdContext);
    state = useStore(state || TreeContext, ["treeGroups", "treeItems"]);

    const childTreeGroup = useMemo(() => {
      return state?.treeGroups.items.find(
        (treeGroup) => treeGroup.treeItemId === id
      );
    }, [state]);

    const parentTreeGroup = useTreeGroupItem(state, parentTreeGroupId);

    const getItem = useCallback(
      (item) => {
        const nextItem = {
          ...item,
          id,
          groupId: parentTreeGroupId,
        };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, parentTreeGroupId, getItemProp]
    );

    const setSize = useMemo(() => {
      return state?.treeItems.items
        .filter((treeItem) => treeItem.groupId === parentTreeGroupId)
        .reduce((acc) => acc + 1, 0);
    }, [state?.treeItems]);

    const posInSet = useMemo(() => {
      return (
        (state?.treeItems.items
          .filter((treeItem) => treeItem.groupId === parentTreeGroupId)
          .findIndex((treeItem) => treeItem.id === id) || 0) + 1
      );
    }, [state?.treeItems]);

    props = useWrapElement(
      props,
      (element) => (
        <TreeItemIdContext.Provider value={id}>
          {element}
        </TreeItemIdContext.Provider>
      ),
      [id]
    );

    props = {
      role: "treeitem",
      "aria-expanded": childTreeGroup?.visible,
      "aria-level": parentTreeGroup?.level || 1,
      "aria-posinset": posInSet,
      "aria-setsize": setSize,
      ...props,
    };

    props = useCompositeItem({
      state,
      ...props,
      shouldRegisterItem:
        !childTreeGroup &&
        (typeof parentTreeGroup === "undefined"
          ? shouldRegisterItem
          : parentTreeGroup.visible),
    });

    props = useCollectionItem({
      state: state?.treeItems,
      ...props,
      getItem,
      shouldRegisterItem,
    });

    return props;
  }
);

export const TreeItem = createComponent<TreeItemOptions>((props) => {
  const htmlProps = useTreeItem(props);
  return createElement("div", htmlProps);
});

export type TreeItemOptions<T extends As = "div"> = Omit<
  CompositeItemOptions<T>,
  "state"
> &
  Omit<CollectionItemOptions, "state"> & {
    /**
     * Object returned by the `useTreeState` hook. If not provided, the
     * parent `Tree` or `TreeGroup` components' context will be
     * used.
     */
    state?: TreeState;
  };

export type TreeItemProps<T extends As = "div"> = Props<TreeItemOptions<T>>;
