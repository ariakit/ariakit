import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_HiddenHideOptions,
  unstable_HiddenHideProps,
  useHiddenHide
} from "../hidden/HiddenHide";
import {
  unstable_DialogState,
  unstable_DialogActions,
  useDialogState
} from "./useDialogState";

export type unstable_DialogHideOptions = unstable_HiddenHideOptions &
  Partial<unstable_DialogState & unstable_DialogActions>;

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
