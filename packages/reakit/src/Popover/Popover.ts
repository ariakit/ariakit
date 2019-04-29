import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { DialogOptions, DialogProps, useDialog } from "../Dialog/Dialog";
import { unstable_createHook } from "../utils/createHook";
import { PopoverStateReturn, usePopoverState } from "./PopoverState";

export type PopoverOptions = DialogOptions &
  Pick<
    Partial<PopoverStateReturn>,
    "unstable_popoverRef" | "unstable_popoverStyles"
  >;

export type PopoverProps = DialogProps;

export const usePopover = unstable_createHook<PopoverOptions, PopoverProps>({
  name: "Popover",
  compose: useDialog,
  useState: usePopoverState,

  useOptions({ modal = false, ...options }) {
    return { modal, ...options };
  },

  useProps(options, htmlProps) {
    return mergeProps(
      {
        ref: options.unstable_popoverRef,
        style: options.unstable_popoverStyles
      } as PopoverProps,
      htmlProps
    );
  }
});

export const Popover = unstable_createComponent({
  as: "div",
  useHook: usePopover,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_roles_states_props`,
      "Popover"
    );
    return unstable_useCreateElement(type, props, children);
  }
});
