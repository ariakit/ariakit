import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_DialogControllerOptions,
  unstable_DialogControllerProps,
  useDialogController
} from "../Dialog/DialogController";
import { usePopoverState, unstable_PopoverStateReturn } from "./PopoverState";

export type unstable_PopoverControllerOptions = unstable_DialogControllerOptions &
  Partial<unstable_PopoverStateReturn>;

export type unstable_PopoverControllerProps = unstable_DialogControllerProps;

export function usePopoverController(
  options: unstable_PopoverControllerOptions,
  htmlProps: unstable_PopoverControllerProps = {}
) {
  htmlProps = mergeProps(
    {
      ref: options.referenceRef
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useDialogController(options, htmlProps);
  htmlProps = unstable_useHook("usePopoverController", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_PopoverControllerOptions> = [
  ...useDialogController.keys,
  ...usePopoverState.keys
];

usePopoverController.keys = keys;

export const PopoverController = unstable_createComponent(
  "button",
  usePopoverController
);
