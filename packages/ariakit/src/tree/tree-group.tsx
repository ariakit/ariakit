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
  CompositeGroupOptions,
  useCompositeGroup,
} from "../composite/composite-group";
import {
  DisclosureContentOptions,
  useDisclosureContent,
  useDisclosureState,
} from "../disclosure";
import {
  TreeContext,
  TreeGroupIdContext,
  TreeItemIdContext,
  useTreeGroupItem,
} from "./__utils";
import { TreeState } from "./tree-state";

function getTreeGroupIsVisible(
  expandedIds?: TreeState["expandedIds"],
  parentTreeItemId?: string
) {
  if (typeof parentTreeItemId === "undefined") return false;
  return expandedIds?.includes(parentTreeItemId) || false;
}

export const useTreeGroup = createHook<TreeGroupOptions>(
  ({ state, shouldRegisterItem = true, getItem: getItemProp, ...props }) => {
    const id = useId(props.id);
    const parentTreeItemId = useContext(TreeItemIdContext);
    const parentTreeGroupId = useContext(TreeGroupIdContext);

    state = useStore(state || TreeContext, [
      "expandedIds",
      "treeGroupLabels",
      "setExpandedIds",
    ]);

    const parentTreeGroup = useTreeGroupItem(state, parentTreeGroupId);

    const visible =
      !!parentTreeItemId &&
      getTreeGroupIsVisible(state?.expandedIds, parentTreeItemId);

    const getItem = useCallback(
      (item) => {
        const nextItem = {
          ...item,
          id,
          treeItemId: parentTreeItemId,
          visible,
          level: (parentTreeGroup?.level || 1) + 1,
        };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, getItemProp, visible]
    );

    props = useWrapElement(
      props,
      (element) => (
        <TreeGroupIdContext.Provider value={id}>
          {element}
        </TreeGroupIdContext.Provider>
      ),
      [id]
    );

    const disclosure = useDisclosureState({ visible });
    props = useDisclosureContent({ state: disclosure, ...props });
    props = useCompositeGroup(props);
    props = useCollectionItem({
      state: state?.treeGroups,
      ...props,
      getItem,
      shouldRegisterItem,
    });

    return props;
  }
);

export const TreeGroup = createComponent<TreeGroupOptions>((props) => {
  const htmlProps = useTreeGroup(props);
  return createElement("div", htmlProps);
});

export type TreeGroupOptions<T extends As = "div"> = Omit<
  CompositeGroupOptions<T>,
  "state"
> &
  Omit<CollectionItemOptions, "state"> &
  Omit<DisclosureContentOptions, "state"> & {
    /**
     * Object returned by the `useTreeState` hook. If not provided, the parent
     * `TreeList` component context will be used.
     */
    state?: TreeState;
  };

export type TreeGroupProps<T extends As = "div"> = Props<TreeGroupOptions<T>>;
