import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_DialogShowOptions,
  unstable_DialogShowProps,
  useDialogShow
} from "../dialog/DialogShow";
import {
  usePopoverState,
  unstable_PopoverStateReturn
} from "./usePopoverState";

export type unstable_PopoverShowOptions = unstable_DialogShowOptions &
  Partial<unstable_PopoverStateReturn>;

export type unstable_PopoverShowProps = unstable_DialogShowProps;

export function usePopoverShow(
  options: unstable_PopoverShowOptions,
  htmlProps: unstable_PopoverShowProps = {}
) {
  htmlProps = useDialogShow(options, htmlProps);
  htmlProps = unstable_useHook("usePopoverShow", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_PopoverShowOptions> = [
  ...useDialogShow.keys,
  ...usePopoverState.keys
];

usePopoverShow.keys = keys;

export const PopoverShow = unstable_createComponent("button", usePopoverShow);
