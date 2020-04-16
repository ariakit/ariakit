import * as React from "react";
import {
  useSealedState,
  SealedInitialState,
} from "reakit-utils/useSealedState";
import {
  PopoverState,
  PopoverActions,
  PopoverInitialState,
  usePopoverState,
  PopoverStateReturn,
} from "../Popover/PopoverState";

export type TooltipState = Omit<PopoverState, "modal"> & {
  /**
   * @private
   */
  unstable_timeout: number;
};

export type TooltipActions = Omit<PopoverActions, "setModal"> & {
  /**
   * @private
   */
  unstable_setTimeout: React.Dispatch<
    React.SetStateAction<TooltipState["unstable_timeout"]>
  >;
};

export type TooltipInitialState = Omit<PopoverInitialState, "modal"> &
  Pick<Partial<TooltipState>, "unstable_timeout">;

export type TooltipStateReturn = Omit<
  PopoverStateReturn,
  "modal" | "setModal"
> &
  TooltipState &
  TooltipActions;

type Listener = (id: string | null) => void;

const state = {
  currentTooltipId: null as string | null,
  listeners: new Set<Listener>(),
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },
  show(id: string | null) {
    this.currentTooltipId = id;
    this.listeners.forEach((listener) => listener(id));
  },
  hide(id: string) {
    if (this.currentTooltipId === id) {
      this.currentTooltipId = null;
      this.listeners.forEach((listener) => listener(null));
    }
  },
};

export function useTooltipState(
  initialState: SealedInitialState<TooltipInitialState> = {}
): TooltipStateReturn {
  const {
    placement = "top",
    unstable_timeout: initialTimeout = 0,
    ...sealed
  } = useSealedState(initialState);
  const [timeout, setTimeout] = React.useState(initialTimeout);
  const showTimeout = React.useRef<number | null>(null);
  const hideTimeout = React.useRef<number | null>(null);

  const popover = usePopoverState({ ...sealed, placement });

  const clearTimeouts = React.useCallback(() => {
    if (showTimeout.current !== null) {
      window.clearTimeout(showTimeout.current);
    }
    if (hideTimeout.current !== null) {
      window.clearTimeout(hideTimeout.current);
    }
  }, []);

  const hide = React.useCallback(() => {
    clearTimeouts();
    popover.hide();
    // Let's give some time so people can move from a reference to another
    // and still show tooltips immediately
    hideTimeout.current = window.setTimeout(() => {
      state.hide(popover.baseId);
    }, timeout);
  }, [clearTimeouts, popover.hide, timeout, popover.baseId]);

  const show = React.useCallback(() => {
    clearTimeouts();
    if (!timeout || state.currentTooltipId) {
      // If there's no timeout or a tooltip visible already, we can show this
      // immediately
      state.show(popover.baseId);
      popover.show();
    } else {
      // There may be a reference with focus whose tooltip is still not visible
      // In this case, we want to update it before it gets shown.
      state.show(null);
      // Otherwise, wait a little bit to show the tooltip
      showTimeout.current = window.setTimeout(() => {
        state.show(popover.baseId);
        popover.show();
      }, timeout);
    }
  }, [clearTimeouts, timeout, popover.show, popover.baseId]);

  React.useEffect(() => {
    return state.subscribe((id) => {
      if (id !== popover.baseId) {
        clearTimeouts();
        if (popover.visible) {
          // Make sure there will be only one tooltip visible
          popover.hide();
        }
      }
    });
  }, [popover.baseId, clearTimeouts, popover.visible, popover.hide]);

  React.useEffect(
    () => () => {
      clearTimeouts();
      state.hide(popover.baseId);
    },
    [clearTimeouts, popover.baseId]
  );

  return {
    ...popover,
    hide,
    show,
    unstable_timeout: timeout,
    unstable_setTimeout: setTimeout,
  };
}

const keys: Array<keyof PopoverStateReturn | keyof TooltipStateReturn> = [
  ...usePopoverState.__keys,
  "unstable_timeout",
  "unstable_setTimeout",
];

useTooltipState.__keys = keys;
