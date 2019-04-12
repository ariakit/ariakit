import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  HiddenDisclosureOptions,
  HiddenDisclosureProps,
  useHiddenDisclosure
} from "../Hidden/HiddenDisclosure";
import { Keys } from "../__utils/types";
import { useDialogState, DialogStateReturn } from "./DialogState";

export type DialogDisclosureOptions = HiddenDisclosureOptions;

export type DialogDisclosureProps = HiddenDisclosureProps;

export function useDialogDisclosure(
  options: DialogDisclosureOptions,
  htmlProps: DialogDisclosureProps = {}
) {
  options = unstable_useOptions("useDialogDisclosure", options, htmlProps);
  htmlProps = mergeProps(
    {
      "aria-haspopup": "dialog"
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useHiddenDisclosure(options, htmlProps);
  htmlProps = unstable_useProps("useDialogDisclosure", options, htmlProps);
  return htmlProps;
}

const keys: Keys<DialogStateReturn & DialogDisclosureOptions> = [
  ...useHiddenDisclosure.__keys,
  ...useDialogState.__keys
];

useDialogDisclosure.__keys = keys;

export const DialogDisclosure = unstable_createComponent({
  as: "button",
  useHook: useDialogDisclosure
});
