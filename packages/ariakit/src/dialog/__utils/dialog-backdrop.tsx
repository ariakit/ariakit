import { KeyboardEvent, MouseEvent, useCallback, useRef } from "react";
import { useMemo } from "react";
import { isSelfTarget } from "ariakit-utils/events";
import {
  useEventCallback,
  useForkRef,
  useSafeLayoutEffect,
} from "ariakit-utils/hooks";
import { noop } from "ariakit-utils/misc";
import { useDisclosureContent } from "../../disclosure/disclosure-content";
import { DialogProps } from "../dialog";
import { usePreviousMouseDownRef } from "./use-previous-mouse-down-ref";

type DialogBackdropProps = Pick<
  DialogProps,
  | "state"
  | "backdrop"
  | "backdropProps"
  | "children"
  | "hideOnInteractOutside"
  | "hideOnEscape"
>;

export function DialogBackdrop({
  state,
  backdrop,
  backdropProps,
  hideOnInteractOutside,
  hideOnEscape,
  children,
}: DialogBackdropProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onClickProp = useEventCallback(backdropProps?.onClick);
  const onKeyDownProp = useEventCallback(backdropProps?.onKeyDown);
  const previousMouseDownRef = usePreviousMouseDownRef(state.mounted);
  const Component = typeof backdrop !== "boolean" ? backdrop || "div" : "div";

  state = useMemo(
    () => ({
      ...state,
      // Override the setContentElement method to prevent the backdrop from
      // overwriting the dialog's content element.
      setContentElement: noop,
    }),
    [state]
  );

  useSafeLayoutEffect(() => {
    const backdrop = ref.current;
    const dialog = state.contentElement;
    if (!backdrop) return;
    if (!dialog) return;
    backdrop.style.zIndex = getComputedStyle(dialog).zIndex;
  }, [state.contentElement]);

  const onClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      onClickProp(event);
      if (event.defaultPrevented) return;
      // TODO: Accept function
      if (!hideOnInteractOutside) return;
      if (!isSelfTarget(event)) return;
      if (previousMouseDownRef.current !== event.currentTarget) return;
      event.stopPropagation();
      state.hide();
    },
    [onClickProp, hideOnInteractOutside, state.hide]
  );

  // When hideOnInteractOutside is false and the backdrop is clicked, the
  // backdrop will receive focus (because we set the tabIndex on it). Therefore,
  // the Escape key will not be captured by the Dialog component. So we listen
  // to it here.
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp(event);
      if (event.defaultPrevented) return;
      if (!hideOnEscape) return;
      if (!isSelfTarget(event)) return;
      if (event.key !== "Escape") return;
      state.hide();
    },
    [onKeyDownProp, hideOnEscape, state.hide]
  );

  const props = useDisclosureContent({
    state,
    id: undefined,
    role: "presentation",
    tabIndex: -1,
    ...backdropProps,
    ref: useForkRef(backdropProps?.ref, ref),
    onClick,
    onKeyDown,
    style: {
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...backdropProps?.style,
    },
  });

  return (
    <Component {...props} data-backdrop={state.contentElement?.id}>
      {children}
    </Component>
  );
}
