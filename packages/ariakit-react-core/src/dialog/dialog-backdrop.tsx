import type { Ref } from "react";
import { cloneElement, isValidElement, useMemo, useRef } from "react";
import { noop } from "@ariakit/core/utils/misc";
import { useDisclosureContent } from "../disclosure/disclosure-content.js";
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

  backdropProps = isValidElement(backdrop)
    ? {
        ref: "ref" in backdrop ? (backdrop.ref as Ref<any>) : undefined,
        ...backdrop.props,
        ...backdropProps,
      }
    : backdropProps;

  const props = useDisclosureContent({
    store,
    id: undefined,
    role: "presentation",
    "data-backdrop": contentElement?.id || "",
    alwaysVisible,
    hidden,
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
    return (
      <Role {...props} render={(props) => cloneElement(backdrop, props)} />
    );
  }

  const Component = typeof backdrop !== "boolean" ? backdrop || "div" : "div";

  return <Role {...props} as={Component} />;
}
