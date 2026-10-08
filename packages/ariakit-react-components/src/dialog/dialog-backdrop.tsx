import { useStoreState } from "@ariakit/react-store";
import { useMergeRefs, useSafeLayoutEffect } from "@ariakit/react-utils";
import { isValidElement, useState } from "react";
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
  /**
   * Runs when the backdrop gets an element. This includes the element that
   * React creates when it replaces the backdrop.
   */
  onElementChange?: () => void;
}

export function DialogBackdrop({
  store,
  backdrop,
  backdropRef,
  onElementChange,
  alwaysVisible,
  hidden,
}: DialogBackdropProps) {
  // The backdrop element is a state and not a ref, so the effects below run
  // again when React replaces the element, such as when the backdrop prop
  // changes to another element type.
  // https://github.com/ariakit/ariakit/issues/7772
  const [backdropElement, setBackdropElement] = useState<HTMLDivElement | null>(
    null,
  );
  const disclosure = useDisclosureStore({ disclosure: store });
  const contentElement = useStoreState(store, "contentElement");

  // Synchronize the backdrop's z-index with the dialog's in the layout phase,
  // where the commit's style recalc absorbs the getComputedStyle read. As a
  // passive effect, this read ran after other effects had already written
  // styles, forcing an extra full style recalc on every open.
  useSafeLayoutEffect(() => {
    const dialog = contentElement;
    if (!backdropElement) return;
    if (!dialog) return;
    const { zIndex } = getComputedStyle(dialog);
    backdropElement.style.setProperty("z-index", zIndex);
  }, [contentElement, backdropElement]);

  // Mark the backdrop element as an ancestor of the dialog, otherwise clicking
  // on it won't close the dialog when the dialog uses portal, in which case
  // elements are only marked outside the portal element.
  useSafeLayoutEffect(() => {
    const id = contentElement?.id;
    if (!id) return;
    if (!backdropElement) return;
    return markAncestor(backdropElement, id);
  }, [contentElement, backdropElement]);

  useSafeLayoutEffect(() => {
    if (!backdropElement) return;
    onElementChange?.();
  }, [backdropElement, onElementChange]);

  const props = useDisclosureContent({
    ref: useMergeRefs(setBackdropElement, backdropRef),
    store: disclosure,
    role: "presentation",
    "data-backdrop": contentElement?.id || "",
    alwaysVisible,
    // Omit the key when the dialog didn't receive `hidden`. An own key holding
    // `undefined` would win the spread over the hidden state that the hook
    // computes, and then get dropped, leaving the backdrop with `display: none`
    // and no `hidden` attribute. Component boundaries drop undefined props for
    // this reason, but this hook call isn't one.
    // https://github.com/ariakit/ariakit/issues/7344
    ...(hidden != null && { hidden }),
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
