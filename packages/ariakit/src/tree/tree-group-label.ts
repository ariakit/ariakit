import { KeyboardEvent, MouseEvent, useCallback, useContext } from "react";
import { useCompositeItem } from "ariakit";
import { useEventCallback, useId } from "ariakit-utils/hooks";
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
  CompositeGroupLabelOptions,
  useCompositeGroupLabel,
} from "../composite/composite-group-label";
import {
  TreeContext,
  TreeGroupIdContext,
  TreeItemIdContext,
  useTreeGroupItem,
} from "./__utils";
import { TreeState } from "./tree-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a label in a tree group. This hook should be
 * used in a component that's wrapped with `TreeGroup` so the
 * `aria-labelledby` is correctly set on the tree group element.
 * @see https://ariakit.org/components/tree
 * @example
 * ```jsx
 * // This component should be wrapped with TreeGroup
 * const props = useTreeGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export const useTreeGroupLabel = createHook<TreeGroupLabelOptions>(
  ({ state, shouldRegisterItem = true, getItem: getItemProp, ...props }) => {
    state = useStore(state || TreeContext);
    const id = useId(props.id);
    const parentTreeGroupId = useContext(TreeGroupIdContext);
    const treeItemId = useContext(TreeItemIdContext);

    const parentTreeGroup = useTreeGroupItem(state, parentTreeGroupId);

    const onClickProp = useEventCallback(props.onClick);

    const onClick = useCallback(
      (event: MouseEvent<HTMLInputElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        state?.toggleExpand(treeItemId);
      },
      [onClickProp, state?.toggleExpand, treeItemId]
    );

    const onKeyDownProp = useEventCallback(props.onKeyDown);

    const onKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDownProp(event);
        if (event.defaultPrevented) return;

        const keyMap = {
          ArrowRight: () => {
            return state?.expand(treeItemId);
          },
          ArrowLeft: () => {
            return state?.collapse(treeItemId);
          },
        };
        const action = keyMap[event.key as keyof typeof keyMap];
        action?.();
      },
      [treeItemId]
    );

    const getItem = useCallback(
      (item) => {
        const nextItem = { ...item, id, treeItemId };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, getItemProp]
    );

    props = {
      ...props,
      onClick,
      onKeyDown,
    };

    props = useCompositeItem({
      state,
      ...props,
      shouldRegisterItem:
        typeof parentTreeGroup === "undefined"
          ? shouldRegisterItem
          : parentTreeGroup.visible,
    });
    props = useCompositeGroupLabel(props);
    props = useCollectionItem({
      state: state?.treeGroupLabels,
      ...props,
      getItem,
      shouldRegisterItem,
    });
    return props;
  }
);

/**
 * A component that renders a label in a tree group. This component should
 * be wrapped with `TreeGroup` so the `aria-labelledby` is correctly set on
 * the tree group element.
 * @see https://ariakit.org/components/tree
 * @example
 * ```jsx
 * const tree = useTreeState();
 * <Tree state={tree}>
 *   <TreeItem>
 *     <TreeGroupLabel>Label</TreeGroupLabel>
 *     <TreeGroup>
 *       <TreeItem value="Item 1" />
 *       <TreeItem value="Item 2" />
 *     </TreeGroup>
 *   </TreeItem>
 * </Tree>
 * ```
 */
export const TreeGroupLabel = createComponent<TreeGroupLabelOptions>(
  (props) => {
    const htmlProps = useTreeGroupLabel(props);
    return createElement("div", htmlProps);
  }
);

export type TreeGroupLabelOptions<T extends As = "div"> = Omit<
  CompositeGroupLabelOptions<T>,
  "state"
> &
  Omit<CollectionItemOptions, "state"> & {
    /**
     * Object returned by the `useTreeState` hook. If not provided, the parent
     * `Tree` component' context will be used.
     */
    state?: TreeState;
  };

export type TreeGroupLabelProps<T extends As = "div"> = Props<
  TreeGroupLabelOptions<T>
>;
