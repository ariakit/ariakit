import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import {
  unstable_HiddenDisclosureOptions,
  unstable_HiddenDisclosureProps,
  useHiddenDisclosure
} from "../Hidden/HiddenDisclosure";
import { Keys } from "../__utils/types";
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
  htmlProps = useHook("useDialogDisclosure", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_DialogDisclosureOptions> = [
  ...useHiddenDisclosure.__keys,
  ...useDialogState.__keys
];

useDialogDisclosure.__keys = keys;

export const DialogDisclosure = unstable_createComponent({
  as: "button",
  useHook: useDialogDisclosure
});
