import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { warning } from "reakit-warning";
import {
  DisclosureContentOptions,
  DisclosureContentHTMLProps,
  useDisclosureContent
} from "../Disclosure/DisclosureContent";
import { useHiddenState } from "./HiddenState";

export type HiddenOptions = DisclosureContentOptions;

export type HiddenHTMLProps = DisclosureContentHTMLProps;

export type HiddenProps = HiddenOptions & HiddenHTMLProps;

export const useHidden = createHook<HiddenOptions, HiddenHTMLProps>({
  name: "Hidden",
  compose: useDisclosureContent,
  useState: useHiddenState,

  useProps(_, htmlProps) {
    warning(
      true,
      "`Hidden` has been renamed to `DisclosureContent`. Using `<Hidden />` will no longer work in future versions.",
      "See https://reakit.io/docs/disclosure"
    );
    return htmlProps;
  }
});

export const Hidden = createComponent({
  as: "div",
  useHook: useHidden
});
