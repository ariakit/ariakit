import { isValidElement, useEffect, useRef } from "react";
import { useDisclosureContent } from "../disclosure/disclosure-content.tsx";
import { useDisclosureStore } from "../disclosure/disclosure-store.ts";
import { Role } from "../role/role.tsx";
import { useSafeLayoutEffect } from "../utils/hooks.ts";
import { useStoreState } from "../utils/store.tsx";
import type { DialogProps } from "./dialog.tsx";
import type { DialogStore } from "./dialog-store.ts";
import { markAncestor } from "./utils/mark-tree-outside.ts";

interface DialogBackdropProps
  extends Pick<DialogProps, "backdrop" | "alwaysVisible" | "hidden"> {
  store: DialogStore;
}

export function DialogBackdrop({
  store,
  backdrop,
  alwaysVisible,
  hidden,
}: DialogBackdropProps) {
  const ref = useRef<HTMLDivElement>(null);
  const disclosure = useDisclosureStore({ disclosure: store });
  const contentElement = useStoreState(store, "contentElement");

  useEffect(() => {
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
    return markAncestor(backdrop, id);
  }, [contentElement]);

  const props = useDisclosureContent({
    ref,
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
