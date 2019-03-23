import * as React from "react";
import Popper, { Placement } from "popper.js";
import { SealedInitialState, useSealedState } from "../__utils/useSealedState";
import {
  unstable_DialogState,
  unstable_DialogActions,
  unstable_DialogInitialState,
  useDialogState
} from "../Dialog/DialogState";

export type unstable_PopoverState = unstable_DialogState & {
  /** TODO: Description */
  referenceRef: React.RefObject<HTMLElement | null>;
  /** TODO: Description */
  popoverRef: React.RefObject<HTMLElement | null>;
  /** TODO: Description */
  arrowRef: React.RefObject<HTMLElement | null>;
  /** TODO: Description */
  popoverStyles: Partial<CSSStyleDeclaration>;
  /** TODO: Description */
  arrowStyles: Partial<CSSStyleDeclaration>;
  /** TODO: Description */
  originalPlacement: Placement;
  /** TODO: Description */
  placement: Placement;
};

export type unstable_PopoverActions = unstable_DialogActions & {
  /** TODO: Description */
  place: React.Dispatch<React.SetStateAction<Placement>>;
};

export type unstable_PopoverInitialState = unstable_DialogInitialState &
  Partial<Pick<unstable_PopoverState, "placement">> & {
    /** TODO: Description */
    flip?: boolean;
    /** TODO: Description */
    shift?: boolean;
    /** TODO: Description */
    gutter?: number;
  };

export type unstable_PopoverStateReturn = unstable_PopoverState &
  unstable_PopoverActions;

export function usePopoverState(
  initialState: SealedInitialState<unstable_PopoverInitialState> = {}
): unstable_PopoverStateReturn {
  const {
    placement: sealedPlacement = "bottom",
    flip = true,
    shift = true,
    gutter = 12,
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
    referenceRef,
    popoverRef,
    arrowRef,
    popoverStyles,
    arrowStyles,
    originalPlacement,
    placement,
    place: React.useCallback(place, [])
  };
}

const keys: Array<keyof unstable_PopoverStateReturn> = [
  ...useDialogState.keys,
  "referenceRef",
  "popoverRef",
  "arrowRef",
  "popoverStyles",
  "arrowStyles",
  "originalPlacement",
  "placement",
  "place"
];

usePopoverState.keys = keys;
