import * as React from "react";
import Popper from "popper.js";
import { SealedInitialState, useSealedState } from "../__utils/useSealedState";
import {
  DialogState,
  DialogActions,
  DialogInitialState,
  useDialogState
} from "../Dialog/DialogState";
import { Keys } from "../__utils/types";

type Placement =
  | "auto-start"
  | "auto"
  | "auto-end"
  | "top-start"
  | "top"
  | "top-end"
  | "right-start"
  | "right"
  | "right-end"
  | "bottom-end"
  | "bottom"
  | "bottom-start"
  | "left-end"
  | "left"
  | "left-start";

export type PopoverState = DialogState & {
  /**
   * The reference element.
   */
  unstable_referenceRef: React.RefObject<HTMLElement | null>;
  /**
   * The popover element.
   * @Private
   */
  unstable_popoverRef: React.RefObject<HTMLElement | null>;
  /**
   * The arrow element.
   * @private
   */
  unstable_arrowRef: React.RefObject<HTMLElement | null>;
  /**
   * Popover styles.
   * @private
   */
  unstable_popoverStyles: Partial<CSSStyleDeclaration>;
  /**
   * Arrow styles.
   * @private
   */
  unstable_arrowStyles: Partial<CSSStyleDeclaration>;
  /**
   * `placement` passed to the hook.
   * @private
   */
  unstable_originalPlacement: Placement;
  /**
   * Actual `placement`.
   */
  placement: Placement;
};

export type PopoverActions = DialogActions & {
  /**
   * Change the `placement` state.
   */
  place: React.Dispatch<React.SetStateAction<Placement>>;
};

export type PopoverInitialState = DialogInitialState &
  Partial<Pick<PopoverState, "placement">> & {
    /**
     * Whether or not flip the popover.
     */
    unstable_flip?: boolean;
    /**
     * Whether or not shift the popover.
     */
    unstable_shift?: boolean;
    /**
     * Offset between the reference and the popover.
     */
    unstable_gutter?: number;
  };

export type PopoverStateReturn = PopoverState & PopoverActions;

export function usePopoverState(
  initialState: SealedInitialState<PopoverInitialState> = {}
): PopoverStateReturn {
  const {
    placement: sealedPlacement = "bottom",
    unstable_flip: flip = true,
    unstable_shift: shift = true,
    unstable_gutter: gutter = 12,
    ...sealed
  } = useSealedState(initialState);

  const popper = React.useRef<Popper | null>(null);
  const referenceRef = React.useRef<HTMLElement>(null);
  const popoverRef = React.useRef<HTMLElement>(null);
  const arrowRef = React.useRef<HTMLElement>(null);

  const [originalPlacement, place] = React.useState(sealedPlacement);
  const [placement, setPlacement] = React.useState(sealedPlacement);
  const [popoverStyles, setPopoverStyles] = React.useState<
    Partial<CSSStyleDeclaration>
  >({});
  const [arrowStyles, setArrowStyles] = React.useState<
    Partial<CSSStyleDeclaration>
  >({});

  const dialog = useDialogState(sealed);

  React.useLayoutEffect(() => {
    if (referenceRef.current && popoverRef.current) {
      popper.current = new Popper(referenceRef.current, popoverRef.current, {
        placement: originalPlacement,
        eventsEnabled: false,
        modifiers: {
          applyStyle: { enabled: false },
          flip: { enabled: flip, padding: 16 },
          shift: { enabled: shift },
          offset: { offset: `0, ${gutter}` },
          arrow: arrowRef.current
            ? { enabled: true, element: arrowRef.current }
            : undefined,
          updateStateModifier: {
            order: 900,
            // TODO: https://github.com/facebook/react/pull/14853
            enabled: process.env.NODE_ENV !== "test",
            fn: data => {
              setPlacement(data.placement);
              setPopoverStyles(data.styles);
              setArrowStyles(data.arrowStyles);
              return data;
            }
          }
        }
      });
    }
    return () => {
      if (popper.current) {
        popper.current.destroy();
      }
    };
  }, [originalPlacement, flip, shift, gutter]);

  React.useLayoutEffect(() => {
    if (!popper.current) return;
    if (dialog.visible) {
      popper.current.enableEventListeners();
    } else {
      popper.current.disableEventListeners();
    }
    popper.current.update();
  }, [dialog.visible]);

  return {
    ...dialog,
    unstable_referenceRef: referenceRef,
    unstable_popoverRef: popoverRef,
    unstable_arrowRef: arrowRef,
    unstable_popoverStyles: popoverStyles,
    unstable_arrowStyles: arrowStyles,
    unstable_originalPlacement: originalPlacement,
    placement,
    place: React.useCallback(place, [])
  };
}

const keys: Keys<PopoverStateReturn> = [
  ...useDialogState.__keys,
  "unstable_referenceRef",
  "unstable_popoverRef",
  "unstable_arrowRef",
  "unstable_popoverStyles",
  "unstable_arrowStyles",
  "unstable_originalPlacement",
  "placement",
  "place"
];

usePopoverState.__keys = keys;
