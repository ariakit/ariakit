import { warning } from "../__utils/warning";
import { unstable_mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { DialogOptions, DialogHTMLProps, useDialog } from "../Dialog/Dialog";
import { unstable_createHook } from "../utils/createHook";
import { PopoverStateReturn, usePopoverState } from "./PopoverState";

export type PopoverOptions = DialogOptions &
  Pick<
    Partial<PopoverStateReturn>,
    "unstable_popoverRef" | "unstable_popoverStyles"
  >;

export type PopoverHTMLProps = DialogHTMLProps;

export type PopoverProps = PopoverOptions & PopoverHTMLProps;

export const usePopover = unstable_createHook<PopoverOptions, PopoverHTMLProps>(
  {
    name: "Popover",
    compose: useDialog,
    useState: usePopoverState,

    useOptions({ modal = false, ...options }) {
      return { modal, ...options };
    },

    useProps(options, htmlProps) {
      return unstable_mergeProps(
        {
          ref: options.unstable_popoverRef,
          style: options.unstable_popoverStyles
        } as PopoverHTMLProps,
        htmlProps
      );
    }
  }
);

export const Popover = unstable_createComponent({
  as: "div",
  useHook: usePopover,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://reakit.io/docs/popover`,
      "Popover"
    );
    return unstable_useCreateElement(type, props, children);
  }
});
