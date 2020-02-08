import * as React from "react";
import { createPopper, Instance as Popper, Boundary } from "@popperjs/core";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";
import {
  DialogState,
  DialogActions,
  DialogInitialState,
  useDialogState,
  DialogStateReturn
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
   * @private
   */
  unstable_update: () => boolean;
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
     * Offset between the reference and the popover: [main axis, alt axis]. Should not be combined with `gutter`.
     */
    unstable_offset?: readonly [number | string, number | string];
    /**
     * Offset between the reference and the popover on the main axis. Should not be combined with `unstable_offset`.
     */
    gutter?: number;
    /**
     * Prevents popover from being positioned outside the boundary.
     */
    unstable_preventOverflow?: boolean;
    /**
     * Boundaries element used by `preventOverflow`.
     */
    unstable_boundariesElement?: Boundary;
  };

export type PopoverStateReturn = DialogStateReturn &
  PopoverState &
  PopoverActions;

export function usePopoverState(
  initialState: SealedInitialState<PopoverInitialState> = {}
): PopoverStateReturn {
  const {
    gutter = 12,
    placement: sealedPlacement = "bottom",
    unstable_flip: flip = true,
    unstable_offset: offset = [
      0,
      gutter
    ] as PopoverInitialState["unstable_offset"],
    unstable_preventOverflow: preventOverflow = true,
    unstable_boundariesElement: boundariesElement = "scrollParent",
    unstable_fixed: fixed = false,
    modal = false,
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

  const dialog = useDialogState({ modal, ...sealed });

  const update = React.useCallback(() => {
    if (popper.current) {
      popper.current.forceUpdate();
      return true;
    }
    return false;
  }, []);

  useIsomorphicEffect(() => {
    if (referenceRef.current && popoverRef.current) {
      popper.current = createPopper(referenceRef.current, popoverRef.current, {
        placement: originalPlacement,
        strategy: fixed ? "fixed" : "absolute",
        modifiers: [
          {
            name: "eventListeners",
            enabled: dialog.visible
          },
          {
            name: "computeStyles",
            options: {
              adaptive: !sealed.unstable_animated
            }
          },
          {
            name: "applyStyles",
            enabled: false
          },
          {
            name: "flip",
            enabled: flip,
            options: { padding: 16 }
          },
          {
            name: "offset",
            options: { offset }
          },
          {
            name: "preventOverflow",
            enabled: preventOverflow,
            options: { boundariesElement, padding: 5 }
          },
          {
            name: "arrow",
            enabled: Boolean(arrowRef.current),
            options: { element: arrowRef.current }
          },
          {
            name: "updateState",
            phase: "write",
            enabled: true,
            fn({ state }) {
              setPlacement(state.placement);
              setPopoverStyles(state.styles.popper as React.CSSProperties);
              setArrowStyles(state.styles.arrow as React.CSSProperties);
            }
          }
        ]
      });
    }
    return () => {
      if (popper.current) {
        popper.current.destroy();
        popper.current = null;
      }
    };
  }, [
    dialog.visible,
    originalPlacement,
    flip,
    gutter,
    preventOverflow,
    boundariesElement,
    fixed
  ]);

  // Ensure that the popover will be correctly positioned with an additional
  // update.
  React.useEffect(() => {
    if (dialog.visible && popper.current) {
      popper.current.update();
    }
  }, [dialog.visible]);

  return {
    ...dialog,
    unstable_referenceRef: referenceRef,
    unstable_popoverRef: popoverRef,
    unstable_arrowRef: arrowRef,
    unstable_popoverStyles: popoverStyles,
    unstable_arrowStyles: arrowStyles,
    unstable_update: update,
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
  "unstable_update",
  "unstable_originalPlacement",
  "placement",
  "place"
];

usePopoverState.__keys = keys;
