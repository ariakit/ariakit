import { isValidElement, useRef } from "react";
import { useDisclosureContent } from "../disclosure/disclosure-content.js";
import { useDisclosureStore } from "../disclosure/disclosure-store.js";
import { Role } from "../role/role.js";
import { useMergeRefs, useSafeLayoutEffect } from "../utils/hooks.js";
import type { DialogProps } from "./dialog.js";
import { markAncestor } from "./utils/mark-tree-outside.js";

type DialogBackdropProps = Pick<
  DialogProps,
  "store" | "backdrop" | "backdropProps" | "alwaysVisible" | "hidden"
>;

export function DialogBackdrop({
  store,
  backdrop,
  backdropProps,
  alwaysVisible,
  hidden,
}: DialogBackdropProps) {
  const ref = useRef<HTMLDivElement>(null);
  const disclosure = useDisclosureStore({ disclosure: store });
  const contentElement = store.useState("contentElement");

  useSafeLayoutEffect(() => {
    const backdrop = ref.current;
    const dialog = contentElement;
    if (!backdrop) return;
    if (!dialog) return;
    backdrop.style.zIndex = getComputedStyle(dialog).zIndex;
  }, [contentElement]);

  // Mark the backdrop element as an ancestor of the dialog, otherwise clicking
  // on it won't close the dialog when the dialog uses portal, in which case
  // elements are only marked outside the portal element.
  useSafeLayoutEffect(() => {
    const id = contentElement?.id;
    if (!id) return;
    const backdrop = ref.current;
    if (!backdrop) return;
    // TODO: Test clicking outside a nested dialog and outside the parent dialog
    // (should close only the nested dialog)
    return markAncestor(backdrop, id);
  }, [contentElement]);

  if (hidden != null) {
    backdropProps = { ...backdropProps, hidden };
  }

  const props = useDisclosureContent({
    store: disclosure,
    role: "presentation",
    "data-backdrop": contentElement?.id || "",
    alwaysVisible,
    ...backdropProps,
    ref: useMergeRefs(backdropProps?.ref, ref),
    style: {
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      ...backdropProps?.style,
    },
  });

  if (!backdrop) return null;

  if (isValidElement(backdrop)) {
    return <Role {...props} render={backdrop} />;
  }

  const Component = typeof backdrop !== "boolean" ? backdrop : "div";
  return <Role {...props} render={<Component />} />;
}
