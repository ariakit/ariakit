import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_DialogToggleOptions,
  unstable_DialogToggleProps,
  useDialogToggle
} from "../dialog/DialogToggle";
import {
  usePopoverState,
  unstable_PopoverStateReturn
} from "./usePopoverState";

export type unstable_PopoverToggleOptions = unstable_DialogToggleOptions &
  Partial<unstable_PopoverStateReturn>;

export type unstable_PopoverToggleProps = unstable_DialogToggleProps;

export function usePopoverToggle(
  options: unstable_PopoverToggleOptions,
  htmlProps: unstable_PopoverToggleProps = {}
) {
  htmlProps = mergeProps(
    {
      ref: options.referenceRef,
      "aria-expanded": Boolean(options.visible),
      "aria-controls": options.baseId,
      "aria-haspopup": true
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useDialogToggle(options, htmlProps);
  htmlProps = unstable_useHook("usePopoverToggle", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_PopoverToggleOptions> = [
  ...useDialogToggle.keys,
  ...usePopoverState.keys
];

usePopoverToggle.keys = keys;

export const PopoverToggle = unstable_createComponent(
  "button",
  usePopoverToggle
);
