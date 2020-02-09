import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { warning } from "reakit-utils/warning";
import {
  DisclosureRegionOptions,
  DisclosureRegionHTMLProps,
  useDisclosureRegion
} from "../Disclosure/DisclosureRegion";
import { useHiddenState } from "./HiddenState";

export type HiddenOptions = DisclosureRegionOptions;

export type HiddenHTMLProps = DisclosureRegionHTMLProps;

export type HiddenProps = HiddenOptions & HiddenHTMLProps;

export const useHidden = createHook<HiddenOptions, HiddenHTMLProps>({
  name: "Hidden",
  compose: useDisclosureRegion,
  useState: useHiddenState,

  useProps(_, htmlProps) {
    warning(
      true,
      "[reakit/Hidden]",
      "`Hidden` has been renamed to `DisclosureRegion`. Using `<Hidden />` will no longer work in future versions.",
      "See https://reakit.io/docs/disclosure"
    );
    return htmlProps;
  }
});

export const Hidden = createComponent({
  as: "div",
  useHook: useHidden
});
