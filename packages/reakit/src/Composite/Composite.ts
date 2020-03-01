import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useCreateElement } from "reakit-system/useCreateElement";
import { useForkRef } from "reakit-utils/useForkRef";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { warning } from "reakit-utils/warning";
import {
  unstable_useIdGroup,
  unstable_IdGroupOptions,
  unstable_IdGroupHTMLProps
} from "../Id/IdGroup";
import { useTabbable, TabbableOptions, TabbableHTMLProps } from "../Tabbable";
import {
  unstable_CompositeStateReturn,
  unstable_useCompositeState
} from "./CompositeState";

export type unstable_CompositeOptions = TabbableOptions &
  unstable_IdGroupOptions &
  Pick<
    Partial<unstable_CompositeStateReturn>,
    "orientation" | "unstable_moves"
  > &
  Pick<
    unstable_CompositeStateReturn,
    | "unstable_focusStrategy"
    | "unstable_compositeRef"
    | "items"
    | "currentId"
    | "registerItem"
    | "unregisterItem"
    | "setCurrentId"
    | "next"
    | "previous"
    | "rows"
    | "up"
    | "down"
    | "first"
    | "last"
  >;

export type unstable_CompositeHTMLProps = TabbableHTMLProps &
  unstable_IdGroupHTMLProps;

export type unstable_CompositeProps = unstable_CompositeOptions &
  unstable_CompositeHTMLProps;

const validCompositeRoles = [
  "grid",
  "tablist",
  "listbox",
  "menu",
  "menubar",
  "toolbar",
  "radiogroup",
  "tree",
  "treegrid"
];

function getCurrentItem({ items, currentId }: unstable_CompositeOptions) {
  if (!items) return undefined;
  return (
    items.find(item => item.id === currentId) ||
    items.find(item => !item.disabled)
  );
}

export const unstable_useComposite = createHook<
  unstable_CompositeOptions,
  unstable_CompositeHTMLProps
>({
  name: "Composite",
  compose: [unstable_useIdGroup, useTabbable],
  useState: unstable_useCompositeState,

  useProps(options, { onKeyDown: htmlOnKeyDown, ref: htmlRef, ...htmlProps }) {
    const ref = React.useRef<HTMLElement>(null);
    const currentItem = getCurrentItem(options);

    React.useEffect(() => {
      if (options.unstable_compositeRef) {
        options.unstable_compositeRef.current = ref.current || undefined;
      }
    }, [options.unstable_compositeRef]);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (event.target !== event.currentTarget) return;
        if (currentItem?.ref.current) {
          if (event.key !== "Tab" && !event.metaKey) {
            event.preventDefault();
            currentItem.ref.current.dispatchEvent(
              new KeyboardEvent("keydown", event)
            );
          }
        }
      },
      [currentItem]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      onKeyDown: useAllCallbacks(onKeyDown, htmlOnKeyDown),
      ...(options.unstable_focusStrategy === "aria-activedescendant"
        ? { "aria-activedescendant": currentItem?.id }
        : {}),
      ...htmlProps
    };
  },

  useComposeProps(options, htmlProps) {
    // @ts-ignore Passing true as the last argument so it doesn't call
    // useIdGroup.useOptions, which was already called before.
    htmlProps = unstable_useIdGroup(options, htmlProps, true);
    // @ts-ignore
    const tabbableHTMLProps = useTabbable(options, htmlProps, true);
    if (options.unstable_focusStrategy === "aria-activedescendant") {
      return tabbableHTMLProps;
    }
    return htmlProps;
  }
});

export const unstable_Composite = createComponent({
  as: "div",
  useHook: unstable_useComposite,
  useCreateElement: (type, props, children) => {
    warning(
      validCompositeRoles.indexOf(props.role) === -1,
      "[reakit/Composite]",
      "You should provide a valid `role` attribute to composite components.",
      "See https://reakit.io/docs/composite"
    );
    return useCreateElement(type, props, children);
  }
});
