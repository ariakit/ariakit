import { createHook, createElement } from "ariakit-utils/system";
import { createMemoComponent } from "ariakit-utils/store";
import { As, Props } from "ariakit-utils/types";
import {
  CompositeContainerOptions,
  useCompositeContainer,
} from "../composite/composite-container";
import { ToolbarItemOptions, useToolbarItem } from "./toolbar-item";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a container for interactive widgets inside
 * toolbar items.
 * @see https://ariakit.org/docs/toolbar
 * @example
 * ```jsx
 * const state = useToolbarState();
 * const props = useToolbarContainer({ state });
 * <Toolbar state={state}>
 *   <Role {...props}>
 *     <input type="text" />
 *   </Role>
 * </Toolbar>
 * ```
 */
export const useToolbarContainer = createHook<ToolbarContainerOptions>(
  ({ state, ...props }) => {
    props = useCompositeContainer({ state, ...props });
    props = useToolbarItem({ state, ...props });
    return props;
  }
);

/**
 * A component that renders a container for interactive widgets inside toolbar
 * items.
 * @see https://ariakit.org/docs/toolbar
 * @example
 * ```jsx
 * const toolbar = useToolbarState();
 * <Toolbar state={toolbar}>
 *   <ToolbarContainer>
 *     <input type="text" />
 *   </ToolbarContainer>
 * </Toolbar>
 * ```
 */
export const ToolbarContainer = createMemoComponent<ToolbarContainerOptions>(
  (props) => {
    const htmlProps = useToolbarContainer(props);
    return createElement("div", htmlProps);
  }
);

export type ToolbarContainerOptions<T extends As = "div"> = Omit<
  CompositeContainerOptions<T>,
  "state"
> &
  ToolbarItemOptions<T>;

export type ToolbarContainerProps<T extends As = "div"> = Props<
  ToolbarContainerOptions<T>
>;
