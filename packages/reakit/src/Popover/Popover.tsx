// TODO: Refactor
import * as React from "react";
import warning from "tiny-warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { unstable_useHook } from "../system/useHook";
import { Portal } from "../Portal/Portal";
import {
  unstable_DialogOptions,
  unstable_DialogProps,
  useDialog
} from "../Dialog/Dialog";
import { unstable_PopoverStateReturn, usePopoverState } from "./PopoverState";

export type unstable_PopoverOptions = unstable_DialogOptions &
  Partial<unstable_PopoverStateReturn>;

export type unstable_PopoverProps = unstable_DialogProps;

export function usePopover(
  { preventBodyScroll = false, ...options }: unstable_PopoverOptions,
  htmlProps: unstable_PopoverProps = {}
) {
  const allOptions = { preventBodyScroll, ...options };
  htmlProps = mergeProps(
    {
      ref: options.popoverRef,
      style: options.popoverStyles
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useDialog(allOptions, htmlProps);
  htmlProps = unstable_useHook("usePopover", allOptions, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_PopoverOptions> = [
  ...useDialog.keys,
  ...usePopoverState.keys
];

usePopover.keys = keys;

export const Popover = unstable_createComponent(
  "div",
  usePopover,
  (type, props, children) => {
    warning(
      props["aria-label"] || props["aria-labelledby"],
      `[reakit/Popover]
You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_roles_states_props`
    );

    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
);
