import * as React from "react";
import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
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
  { unstable_modal = false, ...options }: unstable_PopoverOptions,
  htmlProps: unstable_PopoverProps = {}
) {
  let _options: unstable_PopoverOptions = {
    unstable_modal,
    ...options
  };
  _options = unstable_useOptions("usePopover", _options, htmlProps);

  htmlProps = mergeProps(
    {
      ref: _options.unstable_popoverRef,
      style: _options.unstable_popoverStyles
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useDialog(_options, htmlProps);
  htmlProps = unstable_useProps("usePopover", _options, htmlProps);
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

    if (props["aria-modal"]) {
      return <Portal>{element}</Portal>;
    }
    return element;
  }
});
