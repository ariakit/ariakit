import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { useDialogState, unstable_DialogStateReturn } from "./useDialogState";
import {
  unstable_HiddenHideOptions,
  unstable_HiddenHideProps,
  useHiddenHide
} from "../hidden/HiddenHide";

export type unstable_DialogHideOptions = unstable_HiddenHideOptions &
  Partial<unstable_DialogStateReturn>;

export type unstable_DialogHideProps = unstable_HiddenHideProps;

export function useDialogHide(
  options: unstable_DialogHideOptions,
  htmlProps: unstable_DialogHideProps = {}
) {
  htmlProps = useHiddenHide(options, htmlProps);
  htmlProps = unstable_useHook("useDialogHide", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_DialogHideOptions> = [
  ...useHiddenHide.keys,
  ...useDialogState.keys
];

useDialogHide.keys = keys;

export const DialogHide = unstable_createComponent("button", useDialogHide);
