import * as React from "react";
import Popper, { Placement } from "popper.js";
import { unstable_useId } from "../utils/useId";
import {
  unstable_DialogState,
  unstable_DialogActions,
  unstable_DialogStateOptions,
  useDialogState
} from "../dialog/useDialogState";

export type unstable_PopoverState = unstable_DialogState & {
  /** TODO: Description */
  baseId: string;
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

export type unstable_PopoverStateOptions = unstable_DialogStateOptions &
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

export function usePopoverState({
  placement: initialPlacement = "bottom",
  flip: initialFlip = true,
  shift: initialShift = true,
  gutter: initialGutter = 12,
  ...options
}: unstable_PopoverStateOptions = {}): unstable_PopoverStateReturn {
  const baseId = unstable_useId("popover-");
  const popper = React.useRef<Popper | null>(null);
  const referenceRef = React.useRef<HTMLElement | null>(null);
  const popoverRef = React.useRef<HTMLElement | null>(null);
  const arrowRef = React.useRef<HTMLElement | null>(null);
  const [originalPlacement, place] = React.useState(initialPlacement);
  const [placement, setPlacement] = React.useState(initialPlacement);
  const [popoverStyles, setPopoverStyles] = React.useState<
    Partial<CSSStyleDeclaration>
  >({});
  const [arrowStyles, setArrowStyles] = React.useState<
    Partial<CSSStyleDeclaration>
  >({});
  const [flip] = React.useState(initialFlip);
  const [shift] = React.useState(initialShift);
  const [gutter] = React.useState(initialGutter);

  const dialogState = useDialogState(options);

  React.useLayoutEffect(() => {
    if (dialogState.visible && referenceRef.current && popoverRef.current) {
      popper.current = new Popper(referenceRef.current, popoverRef.current, {
        placement: originalPlacement,
        modifiers: {
          // hide: { enabled: false },
          applyStyle: { enabled: false },
          flip: { enabled: flip, padding: 16 },
          shift: { enabled: shift },
          offset: { offset: `0, ${gutter}` },
          arrow: arrowRef.current
            ? { enabled: true, element: arrowRef.current }
            : undefined,
          updateStateModifier: {
            order: 900,
            enabled: true,
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
  }, [dialogState.visible, originalPlacement, flip, shift, gutter]);

  return {
    ...dialogState,
    baseId,
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
  "baseId",
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
