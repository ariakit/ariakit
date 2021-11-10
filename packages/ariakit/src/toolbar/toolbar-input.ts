import { createMemoComponent } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CompositeInputOptions,
  useCompositeInput,
} from "../composite/composite-input";
import { ToolbarItemOptions, useToolbarItem } from "./toolbar-item";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an input as a toolbar item.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const state = useToolbarState();
 * const props = useToolbarInput({ state });
 * <Toolbar state={state}>
 *   <Role {...props} />
 * </Toolbar>
 * ```
 */
export const useToolbarInput = createHook<ToolbarInputOptions>(
  ({ state, ...props }) => {
    props = useCompositeInput({ state, ...props });
    props = useToolbarItem({ state, ...props });
    return props;
  }
);

/**
 * A component that renders an input as a toolbar item.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const toolbar = useToolbarState();
 * <Toolbar state={toolbar}>
 *   <ToolbarInput />
 * </Toolbar>
 * ```
 */
export const ToolbarInput = createMemoComponent<ToolbarInputOptions>(
  (props) => {
    const htmlProps = useToolbarInput(props);
    return createElement("input", htmlProps);
  }
);

export type ToolbarInputOptions<T extends As = "input"> = Omit<
  CompositeInputOptions<T>,
  "state"
> &
  ToolbarItemOptions<T>;

export type ToolbarInputProps<T extends As = "input"> = Props<
  ToolbarInputOptions<T>
>;
