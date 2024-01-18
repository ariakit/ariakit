import type { ElementType } from "react";
import type { CompositeContainerOptions } from "../composite/composite-container.js";
import { useCompositeContainer } from "../composite/composite-container.js";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.js";
import type { Props } from "../utils/types.js";
import { useToolbarContext } from "./toolbar-context.js";
import type { ToolbarItemOptions } from "./toolbar-item.js";
import { useToolbarItem } from "./toolbar-item.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `ToolbarContainer` component.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const store = useToolbarStore();
 * const props = useToolbarContainer({ store });
 * <Toolbar store={store}>
 *   <Role {...props}>
 *     <input type="text" />
 *   </Role>
 * </Toolbar>
 * ```
 */
export const useToolbarContainer = createHook<TagName, ToolbarContainerOptions>(
  function useToolbarContainer({ store, ...props }) {
    const context = useToolbarContext();
    store = store || context;
    props = useCompositeContainer({ store, ...props });
    props = useToolbarItem<TagName>({ store, ...props });
    return props;
  },
);

/**
 * Renders a toolbar item that may contain interactive widgets inside.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx {2-4}
 * <Toolbar>
 *   <ToolbarContainer>
 *     <input type="text" />
 *   </ToolbarContainer>
 * </Toolbar>
 * ```
 */
export const ToolbarContainer = memo(
  forwardRef(function ToolbarContainer(props: ToolbarContainerProps) {
    const htmlProps = useToolbarContainer(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface ToolbarContainerOptions<T extends ElementType = TagName>
  extends ToolbarItemOptions<T>,
    Omit<CompositeContainerOptions<T>, "store"> {}

export type ToolbarContainerProps<T extends ElementType = TagName> = Props<
  T,
  ToolbarContainerOptions<T>
>;
