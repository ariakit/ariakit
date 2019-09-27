import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  HiddenDisclosureOptions,
  HiddenDisclosureHTMLProps,
  useHiddenDisclosure
} from "../Hidden/HiddenDisclosure";
import { useDialogState } from "./DialogState";

export type DialogDisclosureOptions = HiddenDisclosureOptions;

export type DialogDisclosureHTMLProps = HiddenDisclosureHTMLProps;

export type DialogDisclosureProps = DialogDisclosureOptions &
  DialogDisclosureHTMLProps;

export const useDialogDisclosure = createHook<
  DialogDisclosureOptions,
  DialogDisclosureHTMLProps
>({
  name: "DialogDisclosure",
  compose: useHiddenDisclosure,
  useState: useDialogState,

  useProps(_, htmlProps) {
    return { "aria-haspopup": "dialog", ...htmlProps };
  }
});

export const DialogDisclosure = createComponent({
  as: "button",
  useHook: useDialogDisclosure
});
