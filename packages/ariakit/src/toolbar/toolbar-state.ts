import {
  CompositeState,
  CompositeStateProps,
  useCompositeState,
} from "../composite/composite-state";

/**
 * Provides state for the `Toolbar` component.
 * @example
 * ```jsx
 * const toolbar = useToolbarState();
 * <Toolbar state={toolbar}>
 *   <ToolbarItem>Item 1</ToolbarItem>
 *   <ToolbarItem>Item 2</ToolbarItem>
 *   <ToolbarItem>Item 3</ToolbarItem>
 * </Toolbar>
 * ```
 */
export function useToolbarState({
  orientation = "horizontal",
  focusLoop = true,
  ...props
}: ToolbarStateProps = {}): ToolbarState {
  return useCompositeState({ orientation, focusLoop, ...props });
}

export type ToolbarState = CompositeState;

export type ToolbarStateProps = CompositeStateProps;
