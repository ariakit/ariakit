import { unstable_createComponent } from "../utils/createComponent";
import {
  DialogDisclosureOptions,
  DialogDisclosureHTMLProps,
  useDialogDisclosure
} from "../Dialog/DialogDisclosure";
import { unstable_createHook } from "../utils/createHook";
import { mergeRefs } from "../__utils/mergeRefs";
import { usePopoverState, PopoverStateReturn } from "./PopoverState";

export type PopoverDisclosureOptions = DialogDisclosureOptions &
  Pick<Partial<PopoverStateReturn>, "unstable_referenceRef">;

export type PopoverDisclosureHTMLProps = DialogDisclosureHTMLProps;

export type PopoverDisclosureProps = PopoverDisclosureOptions &
  PopoverDisclosureHTMLProps;

export const usePopoverDisclosure = unstable_createHook<
  PopoverDisclosureOptions,
  PopoverDisclosureHTMLProps
>({
  name: "PopoverDisclosure",
  compose: useDialogDisclosure,
  useState: usePopoverState,

  useProps(options, { ref: htmlRef, ...htmlProps }) {
    return {
      ref: mergeRefs(options.unstable_referenceRef, htmlRef),
      ...htmlProps
    };
  }
});

export const PopoverDisclosure = unstable_createComponent({
  as: "button",
  useHook: usePopoverDisclosure
});
