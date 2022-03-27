import {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useDisclosureContent, useDisclosureState, useGroup } from "ariakit";
import {
  useEventCallback,
  useForkRef,
  useId,
  useWrapElement,
} from "ariakit-utils/hooks";
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
  TreeItemExpandedContext,
  TreeItemIdContext,
  TreeItemLevelContext,
  TreeItemVisibleContext,
  useTreeItemFromCollection,
} from "./__utils";
import { TreeState } from "./tree-state";

export const useTreeItem = createHook<TreeItemOptions>(
  ({ state, getItem: getItemProp, groupId, ...props }) => {
    const ref = useRef<HTMLElement>(null);
    const id = useId(props.id);
    const parentTreeItemId = useContext(TreeItemIdContext) || groupId;
    state = useStore(state || TreeContext);

    const parentTreeItem = useTreeItemFromCollection(state, parentTreeItemId);
    const parentExpanded = useContext(TreeItemExpandedContext);
    const parentVisible = useContext(TreeItemVisibleContext);
    const parentLevel = useContext(TreeItemLevelContext);

    const childTreeItems = useMemo(
      () => state?.items?.filter((item) => item.groupId === id),
      [state?.items, id]
    );

    const hasChildTreeItems = !!childTreeItems?.length;
    const level = (parentLevel ?? (parentTreeItem?.level || 0)) + 1;
    const expanded = useMemo(
      () => !!id && state?.expandedIds?.includes(id),
      [id, state?.expandedIds]
    );

    const visible =
      ((parentVisible ?? true) &&
        (parentExpanded ?? parentTreeItem?.expanded)) ??
      true;

    const onClickProp = useEventCallback(props.onClick);
    const onClick = useCallback(
      (event: MouseEvent<HTMLInputElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        state?.toggleExpand(id);
        event.stopPropagation();
      },
      [onClickProp, state?.toggleExpand, id]
    );

    const onKeyDownProp = useEventCallback(props.onKeyDown);
    const onKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDownProp(event);
        if (event.defaultPrevented) return;

        const keyMap = {
          ArrowRight: () => {
            if (!expanded && hasChildTreeItems) return state?.expand(id);
            childTreeItems?.[0]?.ref.current?.focus();
          },
          ArrowLeft: () => {
            if (expanded) return state?.collapse(id);
            parentTreeItem?.ref.current?.focus();
          },
        };
        const action = keyMap[event.key as keyof typeof keyMap];
        if (action) {
          action();
          event.stopPropagation();
        }
      },
      [
        id,
        state?.expand,
        state?.collapse,
        expanded,
        parentTreeItem?.ref?.current,
        childTreeItems?.[0]?.ref?.current,
        hasChildTreeItems,
      ]
    );

    const getItem = useCallback(
      (item) => {
        const nextItem = {
          ...item,
          id,
          groupId: groupId || parentTreeItemId,
          expanded: expanded && visible,
          level,
          visible,
        };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, getItemProp, groupId, parentTreeItemId, level, expanded, visible]
    );

    const setSize = useMemo(() => {
      return (
        state?.items
          .filter((treeItem) => treeItem.groupId === parentTreeItemId)
          .reduce((acc) => acc + 1, 0) || undefined
      );
    }, [state?.items]);

    const posInSet = useMemo(() => {
      return (
        (state?.items
          .filter((treeItem) => treeItem.groupId === parentTreeItemId)
          .findIndex((treeItem) => treeItem.id === id) || 0) + 1 || undefined
      );
    }, [state?.items]);

    props = useWrapElement(
      props,
      (element) => (
        <TreeItemIdContext.Provider value={id}>
          <TreeItemLevelContext.Provider value={level}>
            <TreeItemExpandedContext.Provider value={expanded}>
              <TreeItemVisibleContext.Provider value={visible}>
                {element}
              </TreeItemVisibleContext.Provider>
            </TreeItemExpandedContext.Provider>
          </TreeItemLevelContext.Provider>
        </TreeItemIdContext.Provider>
      ),
      [id, level, expanded, visible]
    );

    props = {
      role: "treeitem",
      "aria-expanded": id && hasChildTreeItems ? expanded : undefined,
      "aria-level": level,
      "aria-posinset": posInSet,
      "aria-setsize": setSize,
      onClick,
      onKeyDown,
      ref: useForkRef(ref, props.ref),
      ...props,
    };

    props = useGroup(props);

    const disclosure = useDisclosureState({ visible });
    props = useDisclosureContent({ state: disclosure, ...props });
    props = useCompositeItem({
      state,
      ...props,
      getItem,
      id,
      disabled: !visible,
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
    /**
     * Id of the parent tree item or parent group. If not provided, the
     * parent `TreeItem` id will be used.
     */
    groupId?: string;
  };

export type TreeItemProps<T extends As = "div"> = Props<TreeItemOptions<T>>;
