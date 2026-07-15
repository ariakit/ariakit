import { useStoreState } from "@ariakit/react-store";
import { useSafeLayoutEffect } from "@ariakit/react-utils";
import { isValidElement } from "react";
import type { Ref } from "react";
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
  backdropRef?: Ref<HTMLDivElement>;
}

export function DialogBackdrop({
  store,
  backdrop,
  backdropRef,
  alwaysVisible,
  hidden,
}: DialogBackdropProps) {
  const disclosure = useDisclosureStore({ disclosure: store });
  const contentElement = useStoreState(store, "contentElement");
  const backdropElement = useStoreState(disclosure, "contentElement");

  // Synchronize the backdrop's z-index with the dialog's in the layout phase,
  // where the commit's style recalc absorbs the getComputedStyle read. As a
  // passive effect, this read ran after other effects had already written
  // styles, forcing an extra full style recalc on every open.
  useSafeLayoutEffect(() => {
    const backdrop = backdropElement;
    const dialog = contentElement;
    if (!backdrop) return;
    if (!dialog) return;
    backdrop.style.zIndex = getComputedStyle(dialog).zIndex;
  }, [backdropElement, contentElement]);

  // Mark the backdrop element as an ancestor of the dialog, otherwise clicking
  // on it won't close the dialog when the dialog uses portal, in which case
  // elements are only marked outside the portal element.
  useSafeLayoutEffect(() => {
    const id = contentElement?.id;
    if (!id) return;
    const backdrop = backdropElement;
    if (!backdrop) return;
    return markAncestor(backdrop, id);
  }, [backdropElement, contentElement]);

  const props = useDisclosureContent({
    ref: backdropRef,
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
