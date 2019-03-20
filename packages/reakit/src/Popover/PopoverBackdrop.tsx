import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { useHook } from "../system/useHook";
import { Portal } from "../Portal/Portal";
import {
  unstable_DialogBackdropOptions,
  unstable_DialogBackdropProps,
  useDialogBackdrop
} from "../Dialog/DialogBackdrop";
import { usePopoverState, unstable_PopoverStateReturn } from "./PopoverState";

export type unstable_PopoverBackdropOptions = unstable_DialogBackdropOptions &
  Partial<unstable_PopoverStateReturn>;

export type unstable_PopoverBackdropProps = unstable_DialogBackdropProps;

export function usePopoverBackdrop(
  options: unstable_PopoverBackdropOptions,
  htmlProps: unstable_PopoverBackdropProps = {}
) {
  htmlProps = useDialogBackdrop(options, htmlProps);
  htmlProps = useHook("usePopoverBackdrop", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_PopoverBackdropOptions> = [
  ...useDialogBackdrop.keys,
  ...usePopoverState.keys
];

usePopoverBackdrop.keys = keys;

export const PopoverBackdrop = unstable_createComponent(
  "div",
  usePopoverBackdrop,
  (type, props, children) => {
    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
);
