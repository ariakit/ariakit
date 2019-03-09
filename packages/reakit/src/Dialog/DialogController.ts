import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_HiddenControllerOptions,
  unstable_HiddenControllerProps,
  useHiddenController
} from "../Hidden/HiddenController";
import { useDialogState, unstable_DialogStateReturn } from "./useDialogState";

export type unstable_DialogControllerOptions = unstable_HiddenControllerOptions &
  Partial<unstable_DialogStateReturn>;

export type unstable_DialogControllerProps = unstable_HiddenControllerProps;

export function useDialogController(
  options: unstable_DialogControllerOptions,
  htmlProps: unstable_DialogControllerProps = {}
) {
  htmlProps = mergeProps(
    {
      "aria-haspopup": "dialog"
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useHiddenController(options, htmlProps);
  htmlProps = unstable_useHook("useDialogController", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_DialogControllerOptions> = [
  ...useHiddenController.keys,
  ...useDialogState.keys
];

useDialogController.keys = keys;

export const DialogController = unstable_createComponent(
  "button",
  useDialogController
);
