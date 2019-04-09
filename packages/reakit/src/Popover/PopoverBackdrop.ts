import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  unstable_DialogBackdropOptions,
  unstable_DialogBackdropProps,
  useDialogBackdrop
} from "../Dialog/DialogBackdrop";
import { Keys } from "../__utils/types";
import { usePopoverState, unstable_PopoverStateReturn } from "./PopoverState";

export type unstable_PopoverBackdropOptions = unstable_DialogBackdropOptions &
  Partial<unstable_PopoverStateReturn>;

export type unstable_PopoverBackdropProps = unstable_DialogBackdropProps;

export function usePopoverBackdrop(
  options: unstable_PopoverBackdropOptions,
  htmlProps: unstable_PopoverBackdropProps = {}
) {
  options = unstable_useOptions("usePopoverBackdrop", options, htmlProps);
  htmlProps = useDialogBackdrop(options, htmlProps);
  htmlProps = unstable_useProps("usePopoverBackdrop", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_PopoverBackdropOptions> = [
  ...useDialogBackdrop.__keys,
  ...usePopoverState.__keys
];

usePopoverBackdrop.__keys = keys;

export const PopoverBackdrop = unstable_createComponent({
  as: "div",
  useHook: usePopoverBackdrop
});
