import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  DialogBackdropOptions,
  DialogBackdropProps,
  useDialogBackdrop
} from "../Dialog/DialogBackdrop";
import { Keys } from "../__utils/types";
import { usePopoverState, PopoverStateReturn } from "./PopoverState";

export type PopoverBackdropOptions = DialogBackdropOptions;

export type PopoverBackdropProps = DialogBackdropProps;

export function usePopoverBackdrop(
  options: PopoverBackdropOptions,
  htmlProps: PopoverBackdropProps = {}
) {
  options = unstable_useOptions("usePopoverBackdrop", options, htmlProps);
  htmlProps = useDialogBackdrop(options, htmlProps);
  htmlProps = unstable_useProps("usePopoverBackdrop", options, htmlProps);
  return htmlProps;
}

const keys: Keys<PopoverStateReturn & PopoverBackdropOptions> = [
  ...useDialogBackdrop.__keys,
  ...usePopoverState.__keys
];

usePopoverBackdrop.__keys = keys;

export const PopoverBackdrop = unstable_createComponent({
  as: "div",
  useHook: usePopoverBackdrop
});
