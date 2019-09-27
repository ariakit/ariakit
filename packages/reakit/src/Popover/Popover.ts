import { warning } from "reakit-utils/warning";
import { createComponent } from "reakit-system/createComponent";
import { useCreateElement } from "reakit-system/useCreateElement";
import { createHook } from "reakit-system/createHook";
import { mergeRefs } from "reakit-utils/mergeRefs";
import { DialogOptions, DialogHTMLProps, useDialog } from "../Dialog/Dialog";
import { PopoverStateReturn, usePopoverState } from "./PopoverState";

export type PopoverOptions = DialogOptions &
  Pick<
    Partial<PopoverStateReturn>,
    "unstable_popoverRef" | "unstable_popoverStyles"
  >;

export type PopoverHTMLProps = DialogHTMLProps;

export type PopoverProps = PopoverOptions & PopoverHTMLProps;

export const usePopover = createHook<PopoverOptions, PopoverHTMLProps>({
  name: "Popover",
  compose: useDialog,
  useState: usePopoverState,

  useOptions({ modal = false, ...options }) {
    return { modal, ...options };
  },

  useProps(options, { ref: htmlRef, style: htmlStyle, ...htmlProps }) {
    return {
      ref: mergeRefs(options.unstable_popoverRef, htmlRef),
      style: { ...options.unstable_popoverStyles, ...htmlStyle },
      ...htmlProps
    };
  }
});

export const Popover = createComponent({
  as: "div",
  useHook: usePopover,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      "Popover",
      "You should provide either `aria-label` or `aria-labelledby` props.",
      "See https://reakit.io/docs/popover"
    );
    return useCreateElement(type, props, children);
  }
});
