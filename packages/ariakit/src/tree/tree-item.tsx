import {
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useContext,
  useEffect,
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
  TreeItemIdContext,
  TreeItemsSyncContext,
  useTreeItemFromCollection,
} from "./__utils";
import { TreeState } from "./tree-state";

export const useTreeItem = createHook<TreeItemOptions>(
  ({ state, shouldRegisterItem, getItem: getItemProp, groupId, ...props }) => {
    const ref = useRef<HTMLElement>(null);
    const id = useId(props.id);
    const parentTreeItemId = useContext(TreeItemIdContext) || groupId;
    const { items: syncTreeItems, registerItem } =
      useContext(TreeItemsSyncContext) || {};
    state = useStore(state || TreeContext);

    const parentTreeItem = useTreeItemFromCollection(state, parentTreeItemId);

    const childTreeItems = useMemo(
      () => state?.treeItems.items?.filter((item) => item.groupId === id),
      [state?.treeItems.items, id]
    );

    const hasChildTreeItems = !!childTreeItems?.length;
    const expanded = useMemo(
      () => !!id && state?.expandedIds?.includes(id),
      [id, state?.expandedIds]
    );
    const level = (parentTreeItem?.level || 0) + 1;

    const visible = parentTreeItem?.expanded ?? true;

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

    // intentionally run this on rendering to make it SSR-friendly
    let unregisterItem: (() => void) | undefined;
    if (id && !syncTreeItems?.[id]) {
      unregisterItem = registerItem?.(getItem({ ref }));
    }

    useEffect(() => {
      return unregisterItem;
    }, []);

    const setSize = useMemo(() => {
      return (
        state?.treeItems.items
          .filter((treeItem) => treeItem.groupId === parentTreeItemId)
          .reduce((acc) => acc + 1, 0) || undefined
      );
    }, [state?.treeItems]);

    const posInSet = useMemo(() => {
      return (
        (state?.treeItems.items
          .filter((treeItem) => treeItem.groupId === parentTreeItemId)
          .findIndex((treeItem) => treeItem.id === id) || 0) + 1 || undefined
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
      shouldRegisterItem: shouldRegisterItem || visible,
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
    /**
     * Id of the parent tree item or parent group. If not provided, the
     * parent `TreeItem` id will be used.
     */
    groupId?: string;
  };

export type TreeItemProps<T extends As = "div"> = Props<TreeItemOptions<T>>;
