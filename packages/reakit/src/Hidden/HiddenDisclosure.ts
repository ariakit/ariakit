import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { warning } from "reakit-warning";
import {
  DisclosureOptions,
  DisclosureHTMLProps,
  useDisclosure
} from "../Disclosure/Disclosure";
import { useHiddenState } from "./HiddenState";

export type HiddenDisclosureOptions = DisclosureOptions;

export type HiddenDisclosureHTMLProps = DisclosureHTMLProps;

export type HiddenDisclosureProps = HiddenDisclosureOptions &
  HiddenDisclosureHTMLProps;

export const useHiddenDisclosure = createHook<
  HiddenDisclosureOptions,
  HiddenDisclosureHTMLProps
>({
  name: "HiddenDisclosure",
  compose: useDisclosure,
  useState: useHiddenState,

  useProps(_, htmlProps) {
    warning(
      true,
      "`HiddenDisclosure` has been renamed to `Disclosure`. Using `<HiddenDisclosure />` will no longer work in future versions.",
      "See https://reakit.io/docs/disclosure"
    );
    return htmlProps;
  }
});

export const HiddenDisclosure = createComponent({
  as: "button",
  useHook: useHiddenDisclosure
});
