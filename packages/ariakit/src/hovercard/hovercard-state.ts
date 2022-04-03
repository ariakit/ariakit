import { useMemo } from "react";
import { useControlledState } from "ariakit-utils/hooks";
import { SetState } from "ariakit-utils/types";
import {
  PopoverState,
  PopoverStateProps,
  usePopoverState,
} from "../popover/popover-state";

/**
 * Provides state for the `Hovercard` components.
 * @example
 * ```jsx
 * const hovercard = useHovercardState({ placement: "top" });
 * <HovercardAnchor state={hovercard}>@username</HovercardAnchor>
 * <Hovercard state={hovercard}>Details</Hovercard>
 * ```
 */
export function useHovercardState({
  timeout = 500,
  placement = "bottom",
  showTimeout = timeout,
  hideTimeout = timeout,
  ...props
}: HovercardStateProps = {}): HovercardState {
  const [autoFocusOnShow, setAutoFocusOnShow] = useControlledState(
    false,
    props.autoFocusOnShow,
    props.setAutoFocusOnShow
  );
  const popover = usePopoverState({ placement, ...props });

  const state = useMemo(
    () => ({
      ...popover,
      timeout,
      showTimeout,
      hideTimeout,
      autoFocusOnShow,
      setAutoFocusOnShow,
    }),
    [
      popover,
      timeout,
      showTimeout,
      hideTimeout,
      autoFocusOnShow,
      setAutoFocusOnShow,
    ]
  );

  return state;
}

export type HovercardState = PopoverState & {
  /**
   * The amount of time in milliseconds to wait before showing or hiding the
   * popover.
   * @default 500
   */
  timeout: number;
  /**
   * The amount of time in milliseconds to wait before **showing** the popover.
   * It defaults to the value passed to `timeout`.
   */
  showTimeout: number;
  /**
   * The amount of time in milliseconds to wait before **hiding** the popover.
   * It defaults to the value passed to `timeout`.
   */
  hideTimeout: number;
  /**
   * Whether the popover or an element inside it should be focused when it is
   * shown.
   * @default false
   */
  autoFocusOnShow: boolean;
  /**
   * Sets `autoFocusOnShow`.
   */
  setAutoFocusOnShow: SetState<HovercardState["autoFocusOnShow"]>;
};

export type HovercardStateProps = PopoverStateProps &
  Partial<
    Pick<
      HovercardState,
      | "timeout"
      | "showTimeout"
      | "hideTimeout"
      | "autoFocusOnShow"
      | "setAutoFocusOnShow"
    >
  >;
