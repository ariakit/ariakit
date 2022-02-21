import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";

import {
  CompositeGroupOptions,
  useCompositeGroup,
} from "../composite/composite-group";
import { TreeState } from "./tree-state";

export const useTreeGroup = createHook<TreeGroupOptions>(
  ({ state, ...props }) => {
    props = useCompositeGroup(props);
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
> & {
  /**
   * Object returned by the `useTreeState` hook. If not provided, the parent
   * `Tree` component context will be used.
   */
  state?: TreeState;
};

export type TreeGroupProps<T extends As = "div"> = Props<TreeGroupOptions<T>>;
