import { useStoreState } from "@ariakit/react-store";
import { useMergeRefs, useSafeLayoutEffect } from "@ariakit/react-utils";
import { getWindow } from "@ariakit/utils";
import { isValidElement, useRef } from "react";
import type { RefObject } from "react";
import { useDisclosureContent } from "../disclosure/disclosure-content.tsx";
import { useDisclosureStore } from "../disclosure/disclosure-store.ts";
import { Role } from "../role/role.tsx";
import type { DialogStore } from "./dialog-store.ts";
import type { DialogProps } from "./dialog.tsx";
import { markAncestor } from "./utils/mark-tree-outside.ts";

interface DialogBackdropProps extends Pick<
  DialogProps,
  "backdrop" | "alwaysVisible" | "hidden"
> {
  store: DialogStore;
  backdropRef?: RefObject<HTMLDivElement | null>;
}

export function DialogBackdrop({
  store,
  backdrop,
  backdropRef,
  alwaysVisible,
  hidden,
}: DialogBackdropProps) {
  const ref = useRef<HTMLDivElement>(null);
  const disclosure = useDisclosureStore({ disclosure: store });
  const contentElement = useStoreState(store, "contentElement");

  // Synchronize the backdrop's z-index with the dialog's. The
  // getComputedStyle read forces a style flush, and at effect time the
  // document is still dirty from the open commit (portal mount, inert marks
  // on the outside tree), so reading here would duplicate the recalc the
  // browser is about to perform for the frame. Defer the read to a pre-paint
  // animation frame, where the flush is the one the frame does anyway. The
  // z-index is still applied before the backdrop is first painted.
  useSafeLayoutEffect(() => {
    const backdrop = ref.current;
    const dialog = contentElement;
    if (!backdrop) return;
    if (!dialog) return;
    // Use the dialog element's own window so the frame callback and the
    // computed style come from the right realm when the dialog is portaled
    // into another document, such as a popup window.
    const win = getWindow(dialog);
    const rafId = win.requestAnimationFrame(() => {
      backdrop.style.zIndex = win.getComputedStyle(dialog).zIndex;
    });
    return () => win.cancelAnimationFrame(rafId);
  }, [contentElement]);

  // Mark the backdrop element as an ancestor of the dialog, otherwise clicking
  // on it won't close the dialog when the dialog uses portal, in which case
  // elements are only marked outside the portal element.
  useSafeLayoutEffect(() => {
    const id = contentElement?.id;
    if (!id) return;
    const backdrop = ref.current;
    if (!backdrop) return;
    return markAncestor(backdrop, id);
  }, [contentElement]);

  const props = useDisclosureContent({
    ref: useMergeRefs(ref, backdropRef),
    store: disclosure,
    role: "presentation",
    "data-backdrop": contentElement?.id || "",
    alwaysVisible,
    hidden: hidden != null ? hidden : undefined,
    style: {
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  });

  if (!backdrop) return null;

  if (isValidElement(backdrop)) {
    return <Role {...props} render={backdrop} />;
  }

  const Component = typeof backdrop !== "boolean" ? backdrop : "div";
  return <Role {...props} render={<Component />} />;
}
