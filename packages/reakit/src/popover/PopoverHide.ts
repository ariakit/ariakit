import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_DialogHideOptions,
  unstable_DialogHideProps,
  useDialogHide
} from "../dialog/DialogHide";
import {
  usePopoverState,
  unstable_PopoverStateReturn
} from "./usePopoverState";

export type unstable_PopoverHideOptions = unstable_DialogHideOptions &
  Partial<unstable_PopoverStateReturn>;

export type unstable_PopoverHideProps = unstable_DialogHideProps;

export function usePopoverHide(
  options: unstable_PopoverHideOptions,
  htmlProps: unstable_PopoverHideProps = {}
) {
  htmlProps = useDialogHide(options, htmlProps);
  htmlProps = unstable_useHook("usePopoverHide", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_PopoverHideOptions> = [
  ...useDialogHide.keys,
  ...usePopoverState.keys
];

usePopoverHide.keys = keys;

export const PopoverHide = unstable_createComponent("button", usePopoverHide);
