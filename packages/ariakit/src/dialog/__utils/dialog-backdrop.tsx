import { KeyboardEvent, MouseEvent, ReactNode, useRef } from "react";
import { useMemo } from "react";
import { isSelfTarget } from "ariakit-utils/events";
import {
  useBooleanEvent,
  useEvent,
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
  | "hideOnInteractOutside"
  | "hideOnEscape"
> & {
  children?: ReactNode;
};

export function DialogBackdrop({
  state,
  backdrop,
  backdropProps,
  hideOnInteractOutside = true,
  hideOnEscape = true,
  children,
}: DialogBackdropProps) {
  const ref = useRef<HTMLDivElement>(null);

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

  const onClickProp = backdropProps?.onClick;
  const hideOnInteractOutsideProp = useBooleanEvent(hideOnInteractOutside);
  const previousMouseDownRef = usePreviousMouseDownRef(state.mounted);

  const onClick = useEvent((event: MouseEvent<HTMLDivElement>) => {
    onClickProp?.(event);
    if (event.defaultPrevented) return;
    if (!isSelfTarget(event)) return;
    if (previousMouseDownRef.current !== event.currentTarget) return;
    if (!hideOnInteractOutsideProp(event)) return;
    event.stopPropagation();
    state.hide();
  });

  const onKeyDownProp = backdropProps?.onKeyDown;
  const hideOnEscapeProp = useBooleanEvent(hideOnEscape);

  // When hideOnInteractOutside is false and the backdrop is clicked, the
  // backdrop will receive focus (because we set the tabIndex on it). Therefore,
  // the Escape key will not be captured by the Dialog component. So we listen
  // to it here.
  const onKeyDown = useEvent((event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDownProp?.(event);
    if (event.defaultPrevented) return;
    if (event.key !== "Escape") return;
    if (!isSelfTarget(event)) return;
    if (!hideOnEscapeProp(event)) return;
    state.hide();
  });

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

  const Component = typeof backdrop !== "boolean" ? backdrop || "div" : "div";

  return (
    <Component {...props} data-backdrop={state.contentElement?.id}>
      {children}
    </Component>
  );
}
