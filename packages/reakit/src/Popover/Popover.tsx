import * as React from "react";
import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { useHook } from "../system/useHook";
import { Portal } from "../Portal/Portal";
import {
  unstable_DialogOptions,
  unstable_DialogProps,
  useDialog
} from "../Dialog/Dialog";
import { Keys } from "../__utils/types";
import { unstable_PopoverStateReturn, usePopoverState } from "./PopoverState";

export type unstable_PopoverOptions = unstable_DialogOptions &
  Partial<unstable_PopoverStateReturn>;

export type unstable_PopoverProps = unstable_DialogProps;

export function usePopover(
  { unstable_preventBodyScroll = false, ...options }: unstable_PopoverOptions,
  htmlProps: unstable_PopoverProps = {}
) {
  const allOptions: unstable_PopoverOptions = {
    unstable_preventBodyScroll,
    ...options
  };
  htmlProps = mergeProps(
    {
      ref: options.unstable_popoverRef,
      style: options.unstable_popoverStyles
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useDialog(allOptions, htmlProps);
  htmlProps = useHook("usePopover", allOptions, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_PopoverOptions> = [
  ...useDialog.__keys,
  ...usePopoverState.__keys
];

usePopover.__keys = keys;

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

    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
});
