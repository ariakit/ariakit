import type { ReactNode } from "react";
import { useMemo, useRef } from "react";
import { noop } from "@ariakit/core/utils/misc";
import { useDisclosureContent } from "../disclosure/disclosure-content.js";
import { useForkRef, useSafeLayoutEffect } from "../utils/hooks.js";
import type { DialogProps } from "./dialog.js";

type DialogBackdropProps = Pick<
  DialogProps,
  "store" | "backdrop" | "backdropProps" | "hidden"
> & {
  children?: ReactNode;
};

export function DialogBackdrop({
  store,
  backdrop,
  backdropProps,
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

  const props = useDisclosureContent({
    store,
    id: undefined,
    role: "presentation",
    hidden,
    ...backdropProps,
    ref: useForkRef(backdropProps?.ref, ref),
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
    <Component {...props} data-backdrop={contentElement?.id || ""}>
      {children}
    </Component>
  );
}
