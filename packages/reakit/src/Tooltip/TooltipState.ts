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
  show(id: string) {
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

  React.useEffect(() => {
    if (!popover.visible) return undefined;
    return state.subscribe((id) => {
      // Make sure there will be only one tooltip open
      if (id !== popover.baseId) {
        popover.hide();
      }
    });
  }, [popover.visible, popover.baseId, popover.hide]);

  const hide = React.useCallback(() => {
    popover.hide();
    // Avoid race conditions when hide is called before show timeout
    if (showTimeout.current !== null) {
      window.clearTimeout(showTimeout.current);
    }
    // Let's give some time so people can move from a reference to another
    // and still show tooltips immediately
    hideTimeout.current = window.setTimeout(() => {
      state.hide(popover.baseId);
    }, timeout);
  }, [popover.hide, timeout, popover.baseId]);

  const show = React.useCallback(() => {
    // Avoid race conditions when show is called before hide timeout
    if (hideTimeout.current !== null) {
      window.clearTimeout(hideTimeout.current);
    }
    if (!timeout || state.currentTooltipId) {
      // If there's no timeout or a tooltip visible already, we can show this
      // immediately
      state.show(popover.baseId);
      popover.show();
    } else {
      // Otherwise, wait a little bit to show the tooltip
      showTimeout.current = window.setTimeout(() => {
        state.show(popover.baseId);
        popover.show();
      }, timeout);
    }
  }, [timeout, popover.show, popover.baseId]);

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
