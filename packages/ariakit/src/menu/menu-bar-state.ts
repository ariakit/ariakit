import {
  CompositeState,
  CompositeStateProps,
  useCompositeState,
} from "../composite/composite-state";

/**
 * Provides state for the `MenuBar` component.
 * @example
 * ```jsx
 * const menu = useMenuBarState();
 * <MenuBar state={menu} />
 * ```
 */
export function useMenuBarState({
  orientation = "horizontal",
  focusLoop = true,
  ...props
}: MenuBarStateProps = {}): MenuBarState {
  const composite = useCompositeState({ orientation, focusLoop, ...props });
  return composite;
}

export type MenuBarState = CompositeState;

export type MenuBarStateProps = CompositeStateProps;
