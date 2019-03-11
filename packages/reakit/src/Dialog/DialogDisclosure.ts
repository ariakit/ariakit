import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_HiddenDisclosureOptions,
  unstable_HiddenDisclosureProps,
  useHiddenDisclosure
} from "../Hidden/HiddenDisclosure";
import { useDialogState, unstable_DialogStateReturn } from "./DialogState";

export type unstable_DialogDisclosureOptions = unstable_HiddenDisclosureOptions &
  Partial<unstable_DialogStateReturn>;

export type unstable_DialogDisclosureProps = unstable_HiddenDisclosureProps;

export function useDialogDisclosure(
  options: unstable_DialogDisclosureOptions,
  htmlProps: unstable_DialogDisclosureProps = {}
) {
  htmlProps = mergeProps(
    {
      "aria-haspopup": "dialog"
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useHiddenDisclosure(options, htmlProps);
  htmlProps = unstable_useHook("useDialogDisclosure", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_DialogDisclosureOptions> = [
  ...useHiddenDisclosure.keys,
  ...useDialogState.keys
];

useDialogDisclosure.keys = keys;

export const DialogDisclosure = unstable_createComponent(
  "button",
  useDialogDisclosure
);
