import { useCallback, useEffect, useMemo, useRef } from "react";
import { useControlledState } from "ariakit-utils/hooks";
import { applyState } from "ariakit-utils/misc";
import {
  PopoverState,
  PopoverStateProps,
  usePopoverState,
} from "../popover/popover-state";
import { createGlobalTooltipState } from "./__utils";

const globalState = createGlobalTooltipState();

/**
 * Provides state for the `Tooltip` components.
 * @example
 * ```jsx
 * const tooltip = useTooltipState();
 * <TooltipAnchor state={tooltip}>Anchor</TooltipAnchor>
 * <Tooltip state={tooltip}>Tooltip</Tooltip>
 * ```
 */
export function useTooltipState({
  placement = "top",
  timeout = 0,
  gutter = 8,
  ...props
}: TooltipStateProps = {}): TooltipState {
  const ref = useRef();
  const showTimeout = useRef<number>();
  const hideTimeout = useRef<number>();

  const [visible, _setVisible] = useControlledState(
    props.defaultVisible ?? false,
    props.visible,
    props.setVisible
  );

  const clearTimeouts = useCallback(() => {
    window.clearTimeout(showTimeout.current);
    window.clearTimeout(hideTimeout.current);
  }, []);

  const setVisible: typeof _setVisible = useCallback(
    (arg) => {
      _setVisible((prevVisible) => {
        clearTimeouts();
        const nextVisible = applyState(arg, prevVisible);
        if (nextVisible) {
          if (!timeout || globalState.activeRef) {
            // If there's no timeout or a tooltip visible already, we can show
            // this immediately.
            globalState.show(ref);
          } else {
            // There may be a reference with focus whose tooltip is still not
            // visible In this case, we want to update it before it gets shown.
            globalState.show(null);
            // Otherwise, wait a little bit to show the tooltip.
            showTimeout.current = window.setTimeout(() => {
              globalState.show(ref);
              _setVisible(true);
            }, timeout);
            return prevVisible;
          }
        } else {
          // Let's give some time so people can move from a reference to
          // another and still show tooltips immediately.
          hideTimeout.current = window.setTimeout(() => {
            globalState.hide(ref);
          }, timeout);
        }
        return nextVisible;
      });
    },
    [_setVisible, clearTimeouts, timeout]
  );

  const popover = usePopoverState({
    placement,
    gutter,
    ...props,
    visible,
    setVisible,
  });

  useEffect(() => {
    return globalState.subscribe((activeRef) => {
      if (activeRef !== ref) {
        clearTimeouts();
        if (popover.visible) {
          // Make sure there will be only one tooltip visible
          popover.hide();
        }
      }
    });
  }, [clearTimeouts, popover.visible, popover.hide]);

  useEffect(
    () => () => {
      clearTimeouts();
      globalState.hide(ref);
    },
    [clearTimeouts]
  );

  const state = useMemo(() => ({ ...popover, timeout }), [popover, timeout]);

  return state;
}

export type TooltipState = PopoverState & {
  /**
   * The amount in milliseconds to wait before showing the tooltip. When there's
   * already a visible tooltip in the page, this value will be ignored and other
   * tooltips will be shown immediately.
   * @default 0
   */
  timeout: number;
};

export type TooltipStateProps = PopoverStateProps &
  Partial<Pick<TooltipState, "timeout">>;
