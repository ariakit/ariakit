import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useControlledState } from "ariakit-utils/hooks";
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

  const clearTimeouts = useCallback(() => {
    window.clearTimeout(showTimeout.current);
    window.clearTimeout(hideTimeout.current);
  }, []);

  const [_visible, __setVisible] = useState(props.defaultOpen ?? false);

  const _setVisible = (nextVisible: boolean) => {
    props.setOpen?.(nextVisible);
    if (props.open === undefined) {
      __setVisible(nextVisible);
    }
  };

  const [open, setOpen] = useControlledState(
    props.defaultOpen ?? false,
    props.open ?? _visible,
    (nextVisible) => {
      clearTimeouts();
      if (nextVisible) {
        if (!timeout || globalState.activeRef) {
          // If there's no timeout or a tooltip visible already, we can show
          // this immediately.
          globalState.show(ref);
        } else {
          // There may be a reference with focus whose tooltip is still not
          // visible In this case, we want to update it before it gets shown.
          globalState.show(null);
          // Wait for the timeout to show the tooltip.
          showTimeout.current = window.setTimeout(() => {
            globalState.show(ref);
            _setVisible(nextVisible);
          }, timeout);
          return;
        }
      } else {
        // Let's give some time so people can move from a reference to
        // another and still show tooltips immediately.
        hideTimeout.current = window.setTimeout(() => {
          globalState.hide(ref);
        }, timeout);
      }
      _setVisible(nextVisible);
    }
  );

  const popover = usePopoverState({
    placement,
    gutter,
    ...props,
    open,
    setOpen,
  });

  useEffect(() => {
    return globalState.subscribe((activeRef) => {
      if (activeRef !== ref) {
        clearTimeouts();
        if (popover.open) {
          // Make sure there will be only one tooltip open
          popover.hide();
        }
      }
    });
  }, [clearTimeouts, popover.open, popover.hide]);

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
