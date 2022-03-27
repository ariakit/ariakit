import { useContext } from "react";
import { useGroupLabel } from "ariakit";
import { useStore } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { Props } from "ariakit-utils/types";
import { CollectionItemOptions } from "../collection/collection-item";
import {
  TreeContext,
  TreeItemIdContext,
  useTreeItemFromCollection,
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
    const parentTreeItemId = useContext(TreeItemIdContext);
    const parentTreeItem = useTreeItemFromCollection(state, parentTreeItemId);

    props = useGroupLabel(props);
    props = {
      "data-label": "",
      "data-parent-expanded": parentTreeItem?.expanded,
      "data-parent-level": parentTreeItem?.level,
      "data-parent-visible": parentTreeItem?.visible,
      ...props,
    };

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
    return createElement("span", htmlProps);
  }
);

export type TreeGroupLabelOptions = Omit<CollectionItemOptions, "state"> & {
  /**
   * Object returned by the `useTreeState` hook. If not provided, the parent
   * `Tree` component context will be used.
   */
  state?: TreeState;
};

export type TreeGroupLabelProps = Props<TreeGroupLabelOptions>;
