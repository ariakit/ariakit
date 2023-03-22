import {
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useRef,
} from "react";
import { useMemo } from "react";
import { isSelfTarget } from "@ariakit/core/utils/events";
import { noop } from "@ariakit/core/utils/misc";
import { useDisclosureContent } from "../disclosure/disclosure-content.js";
import {
  useBooleanEvent,
  useEvent,
  useForkRef,
  useSafeLayoutEffect,
} from "../utils/hooks.js";
import { DialogProps } from "./dialog.js";
import { usePreviousMouseDownRef } from "./utils/use-previous-mouse-down-ref.js";

type DialogBackdropProps = Pick<
  DialogProps,
  | "store"
  | "backdrop"
  | "backdropProps"
  | "hideOnInteractOutside"
  | "hideOnEscape"
  | "hidden"
> & {
  children?: ReactNode;
};

export function DialogBackdrop({
  store,
  backdrop,
  backdropProps,
  hideOnInteractOutside = true,
  hideOnEscape = true,
  hidden,
  children,
}: DialogBackdropProps) {
  const ref = useRef<HTMLDivElement>(null);

  store = useMemo(
    () => ({
      ...store,
      // Override the setContentElement method to prevent the backdrop from
      // overwriting the dialog's content element. TODO: Refactor this.
      setContentElement: noop,
    }),
    [store]
  );

  const contentElement = store.useState("contentElement");

  useSafeLayoutEffect(() => {
    const backdrop = ref.current;
    const dialog = contentElement;
    if (!backdrop) return;
    if (!dialog) return;
    backdrop.style.zIndex = getComputedStyle(dialog).zIndex;
  }, [contentElement]);

  const onClickProp = backdropProps?.onClick;
  const hideOnInteractOutsideProp = useBooleanEvent(hideOnInteractOutside);
  const mounted = store.useState("mounted");
  const previousMouseDownRef = usePreviousMouseDownRef(mounted);

  const onClick = useEvent((event: ReactMouseEvent<HTMLDivElement>) => {
    onClickProp?.(event);
    if (event.defaultPrevented) return;
    if (!isSelfTarget(event)) return;
    if (previousMouseDownRef.current !== event.currentTarget) return;
    if (!hideOnInteractOutsideProp(event)) return;
    event.stopPropagation();
    store.hide();
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
    store.hide();
  });

  const props = useDisclosureContent({
    store,
    id: undefined,
    role: "presentation",
    tabIndex: -1,
    hidden,
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
    <Component {...props} data-backdrop={contentElement?.id}>
      {children}
    </Component>
  );
}
