import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import {
  unstable_DialogDisclosureOptions,
  unstable_DialogDisclosureProps,
  useDialogDisclosure
} from "../Dialog/DialogDisclosure";

import { usePopoverState, unstable_PopoverStateReturn } from "./PopoverState";

export type unstable_PopoverDisclosureOptions = unstable_DialogDisclosureOptions &
  Partial<unstable_PopoverStateReturn>;

export type unstable_PopoverDisclosureProps = unstable_DialogDisclosureProps;

export function usePopoverDisclosure(
  options: unstable_PopoverDisclosureOptions,
  htmlProps: unstable_PopoverDisclosureProps = {}
) {
  htmlProps = mergeProps(
    {
      ref: options.referenceRef
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useDialogDisclosure(options, htmlProps);
  htmlProps = useHook("usePopoverDisclosure", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_PopoverDisclosureOptions> = [
  ...useDialogDisclosure.keys,
  ...usePopoverState.keys
];

usePopoverDisclosure.keys = keys;

export const PopoverDisclosure = unstable_createComponent(
  "button",
  usePopoverDisclosure
);
