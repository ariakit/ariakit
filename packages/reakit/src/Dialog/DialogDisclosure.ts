import { unstable_createComponent } from "../utils/createComponent";
import {
  HiddenDisclosureOptions,
  HiddenDisclosureProps,
  useHiddenDisclosure
} from "../Hidden/HiddenDisclosure";
import { unstable_createHook } from "../utils/createHook";
import { mergeProps } from "../utils";
import { useDialogState } from "./DialogState";

export type DialogDisclosureOptions = HiddenDisclosureOptions;

export type DialogDisclosureProps = HiddenDisclosureProps;

export const useDialogDisclosure = unstable_createHook<
  DialogDisclosureOptions,
  DialogDisclosureProps
>({
  name: "DialogDisclosure",
  compose: useHiddenDisclosure,
  useState: useDialogState,

  useProps(_, htmlProps) {
    return mergeProps(
      {
        "aria-haspopup": "dialog"
      } as DialogDisclosureProps,
      htmlProps
    );
  }
});

export const DialogDisclosure = unstable_createComponent({
  as: "button",
  useHook: useDialogDisclosure
});
