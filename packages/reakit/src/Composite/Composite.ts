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

export type unstable_CompositeOptions = Omit<
  TabbableOptions,
  "unstable_clickOnSpace" | "unstable_clickOnEnter"
> &
  unstable_IdGroupOptions &
  Pick<Partial<unstable_CompositeStateReturn>, "unstable_focusStrategy"> &
  Pick<unstable_CompositeStateReturn, "items" | "currentId">;

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
  return items.find(item => item.id === currentId);
}

function canTransferKeyboardEvent(event: React.KeyboardEvent) {
  if (event.target !== event.currentTarget) return false;
  if (event.metaKey) return false;
  if (event.key === "Tab") return false;
  return true;
}

export const unstable_useComposite = createHook<
  unstable_CompositeOptions,
  unstable_CompositeHTMLProps
>({
  name: "Composite",
  compose: [unstable_useIdGroup, useTabbable],
  useState: unstable_useCompositeState,

  useOptions(options) {
    return {
      ...options,
      unstable_clickOnSpace: false,
      unstable_clickOnEnter: false
    };
  },

  useProps(options, { ref: htmlRef, onKeyDown: htmlOnKeyDown, ...htmlProps }) {
    const ref = React.useRef<HTMLElement>(null);
    const currentItem = getCurrentItem(options);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (canTransferKeyboardEvent(event)) {
          const currentElement = currentItem?.ref.current;
          if (currentElement) {
            currentElement.dispatchEvent(new KeyboardEvent("keydown", event));
            event.preventDefault();
          }
        }
      },
      [currentItem]
    );

    return {
      ref: useForkRef(ref, htmlRef),
      id: options.baseId,
      onKeyDown: useAllCallbacks(onKeyDown, htmlOnKeyDown),
      "aria-activedescendant":
        options.unstable_focusStrategy === "aria-activedescendant"
          ? currentItem?.id
          : undefined,
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
      // Composite will only be tabbable by default if the focus is managed
      // using aria-activedescendant, which requires DOM focus on the container
      // element (the composite)
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
      `[reakit/Composite#${props.id}]`,
      "You should provide a valid `role` attribute to composite components.",
      "See https://reakit.io/docs/composite"
    );

    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      `[reakit/Composite#${props.id}]`,
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/composite"
    );

    return useCreateElement(type, props, children);
  }
});
