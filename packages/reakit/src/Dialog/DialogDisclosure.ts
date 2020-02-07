import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import {
  DisclosureOptions,
  DisclosureHTMLProps,
  useDisclosure
} from "../Disclosure/Disclosure";
import { useDialogState } from "./DialogState";

export type DialogDisclosureOptions = DisclosureOptions;

export type DialogDisclosureHTMLProps = DisclosureHTMLProps;

export type DialogDisclosureProps = DialogDisclosureOptions &
  DialogDisclosureHTMLProps;

export const useDialogDisclosure = createHook<
  DialogDisclosureOptions,
  DialogDisclosureHTMLProps
>({
  name: "DialogDisclosure",
  compose: useDisclosure,
  useState: useDialogState,

  useProps(_, htmlProps) {
    return { "aria-haspopup": "dialog", ...htmlProps };
  }
});

export const DialogDisclosure = createComponent({
  as: "button",
  useHook: useDialogDisclosure
});
