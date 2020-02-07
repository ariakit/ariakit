import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import {
  DialogDisclosureOptions,
  DialogDisclosureHTMLProps,
  useDialogDisclosure
} from "../Dialog/DialogDisclosure";
import { usePopoverState, PopoverStateReturn } from "./PopoverState";

export type PopoverDisclosureOptions = DialogDisclosureOptions &
  Pick<Partial<PopoverStateReturn>, "unstable_referenceRef">;

export type PopoverDisclosureHTMLProps = DialogDisclosureHTMLProps;

export type PopoverDisclosureProps = PopoverDisclosureOptions &
  PopoverDisclosureHTMLProps;

export const usePopoverDisclosure = createHook<
  PopoverDisclosureOptions,
  PopoverDisclosureHTMLProps
>({
  name: "PopoverDisclosure",
  compose: useDialogDisclosure,
  useState: usePopoverState,

  useProps(options, { ref: htmlRef, ...htmlProps }) {
    return {
      ref: useForkRef(options.unstable_referenceRef, htmlRef),
      ...htmlProps
    };
  }
});

export const PopoverDisclosure = createComponent({
  as: "button",
  useHook: usePopoverDisclosure
});
