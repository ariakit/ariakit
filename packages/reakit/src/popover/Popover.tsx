// TODO: Refactor
import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { unstable_useHook } from "../system/useHook";
import { unstable_Portal as Portal } from "../portal/Portal";
import {
  unstable_PopoverStateReturn,
  usePopoverState
} from "./usePopoverState";
import {
  unstable_DialogOptions,
  unstable_DialogProps,
  useDialog
} from "../dialog/Dialog";

export type unstable_PopoverOptions = unstable_DialogOptions &
  Partial<unstable_PopoverStateReturn> & {
    /** TODO: Description */
    unstable_hideOnClickOutside?: boolean;
  };

export type unstable_PopoverProps = unstable_DialogProps;

export function usePopover(
  { unstable_hideOnClickOutside = true, ...options }: unstable_PopoverOptions,
  htmlProps: unstable_PopoverProps = {}
) {
  React.useEffect(() => {
    if (!unstable_hideOnClickOutside) return undefined;
    const handleClickOutside = (e: MouseEvent) => {
      // TODO: Cascading hide
      const { popoverRef, visible, hide } = options;
      const shouldHide =
        popoverRef &&
        popoverRef.current &&
        // parentNode is the portal wrapper
        // we're using it (instead of just popoverRef.current)
        // to include nested portals
        popoverRef.current.parentNode &&
        !popoverRef.current.parentNode.contains(e.target as Node) &&
        visible &&
        hide;
      if (shouldHide) {
        // it's possible that the outside click was on a toggle button
        // in that case, we should "wait" before hiding it
        // otherwise it could hide before and then toggle, showing it again
        setTimeout(() => visible && hide && hide());
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [
    unstable_hideOnClickOutside,
    options.visible,
    options.hide,
    options.popoverRef
  ]);

  const allOptions = {
    unstable_hideOnClickOutside,
    ...options
  };

  htmlProps = mergeProps(
    {
      id: options.baseId,
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
  ...usePopoverState.keys,
  "unstable_hideOnClickOutside"
];

usePopover.keys = keys;

export const Popover = unstable_createComponent(
  "div",
  usePopover,
  // @ts-ignore: TODO typeof createElement
  (type, props, children) => {
    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
);
