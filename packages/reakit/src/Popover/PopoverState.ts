import * as React from "react";
import Popper from "popper.js";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import {
  DialogState,
  DialogActions,
  DialogInitialState,
  useDialogState
} from "../Dialog/DialogState";

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
   * @private
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
  unstable_popoverStyles: React.CSSProperties;
  /**
   * Arrow styles.
   * @private
   */
  unstable_arrowStyles: React.CSSProperties;
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
     * Whether or not the popover should have `position` set to `fixed`.
     */
    unstable_fixed?: boolean;
    /**
     * Flip the popover's placement when it starts to overlap its reference
     * element.
     */
    unstable_flip?: boolean;
    /**
     * Shift popover on the start or end of its reference element.
     */
    unstable_shift?: boolean;
    /**
     * Offset between the reference and the popover.
     */
    unstable_gutter?: number;
    /**
     * Prevents popover from being positioned outside the boundary.
     */
    unstable_preventOverflow?: boolean;
    /**
     * Boundaries element used by `preventOverflow`.
     */
    unstable_boundariesElement?: Popper.Boundary;
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
    unstable_preventOverflow: preventOverflow = true,
    unstable_boundariesElement: boundariesElement = "scrollParent",
    unstable_fixed: fixed = false,
    ...sealed
  } = useSealedState(initialState);

  const popper = React.useRef<Popper | null>(null);
  const referenceRef = React.useRef<HTMLElement>(null);
  const popoverRef = React.useRef<HTMLElement>(null);
  const arrowRef = React.useRef<HTMLElement>(null);

  const [originalPlacement, place] = React.useState(sealedPlacement);
  const [placement, setPlacement] = React.useState(sealedPlacement);
  const [popoverStyles, setPopoverStyles] = React.useState<React.CSSProperties>(
    {}
  );
  const [arrowStyles, setArrowStyles] = React.useState<React.CSSProperties>({});

  const dialog = useDialogState(sealed);

  React.useLayoutEffect(() => {
    if (referenceRef.current && popoverRef.current) {
      popper.current = new Popper(referenceRef.current, popoverRef.current, {
        placement: originalPlacement,
        eventsEnabled: dialog.visible,
        positionFixed: fixed,
        modifiers: {
          applyStyle: { enabled: false },
          flip: { enabled: flip, padding: 16 },
          shift: { enabled: shift },
          offset: { enabled: shift, offset: `0, ${gutter}` },
          preventOverflow: { enabled: preventOverflow, boundariesElement },
          arrow: arrowRef.current
            ? { enabled: true, element: arrowRef.current }
            : undefined,
          updateStateModifier: {
            order: 900,
            enabled: true,
            fn: data => {
              setPlacement(data.placement);
              setPopoverStyles(data.styles as React.CSSProperties);

              // https://github.com/reakit/reakit/issues/408
              if (
                data.arrowStyles.left != null &&
                !isNaN(+data.arrowStyles.left) &&
                data.arrowStyles.top != null &&
                !isNaN(+data.arrowStyles.top)
              ) {
                setArrowStyles(data.arrowStyles as React.CSSProperties);
              }

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
  }, [
    dialog.visible,
    originalPlacement,
    flip,
    shift,
    gutter,
    preventOverflow,
    boundariesElement,
    fixed
  ]);

  // Schedule an update if popover has initial visible state set to true
  // So it'll be correctly positioned
  React.useEffect(() => {
    if (sealed.visible && popper.current) {
      popper.current.scheduleUpdate();
    }
  }, [sealed.visible]);

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

const keys: Array<keyof PopoverStateReturn> = [
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
