import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { useDialogState, unstable_DialogStateReturn } from "./useDialogState";
import {
  unstable_HiddenToggleOptions,
  unstable_HiddenToggleProps,
  useHiddenToggle
} from "../hidden/HiddenToggle";

export type unstable_DialogToggleOptions = unstable_HiddenToggleOptions &
  Partial<unstable_DialogStateReturn>;

export type unstable_DialogToggleProps = unstable_HiddenToggleProps;

export function useDialogToggle(
  options: unstable_DialogToggleOptions,
  htmlProps: unstable_DialogToggleProps = {}
) {
  htmlProps = useHiddenToggle(options, htmlProps);
  htmlProps = unstable_useHook("useDialogToggle", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_DialogToggleOptions> = [
  ...useHiddenToggle.keys,
  ...useDialogState.keys
];

useDialogToggle.keys = keys;

export const DialogToggle = unstable_createComponent("button", useDialogToggle);
