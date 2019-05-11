import { unstable_createComponent } from "../utils/createComponent";
import {
  HiddenDisclosureOptions,
  HiddenDisclosureHTMLProps,
  useHiddenDisclosure
} from "../Hidden/HiddenDisclosure";
import { unstable_createHook } from "../utils/createHook";
import { unstable_mergeProps } from "../utils";
import { useDialogState } from "./DialogState";

export type DialogDisclosureOptions = HiddenDisclosureOptions;

export type DialogDisclosureHTMLProps = HiddenDisclosureHTMLProps;

export type DialogDisclosureProps = DialogDisclosureOptions &
  DialogDisclosureHTMLProps;

export const useDialogDisclosure = unstable_createHook<
  DialogDisclosureOptions,
  DialogDisclosureHTMLProps
>({
  name: "DialogDisclosure",
  compose: useHiddenDisclosure,
  useState: useDialogState,

  useProps(_, htmlProps) {
    return unstable_mergeProps(
      {
        "aria-haspopup": "dialog"
      } as DialogDisclosureHTMLProps,
      htmlProps
    );
  }
});

export const DialogDisclosure = unstable_createComponent({
  as: "button",
  useHook: useDialogDisclosure
});
