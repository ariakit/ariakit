import {
  unstable_HiddenProps,
  unstable_HiddenOptions
} from "reakit/Hidden/Hidden";
import { mergeProps } from "reakit/utils/mergeProps";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapHiddenOptions = BootstrapBoxOptions &
  unstable_HiddenOptions;

export function useHiddenProps(
  options: BootstrapHiddenOptions,
  htmlProps: unstable_HiddenProps = {}
) {
  return mergeProps(
    {
      style: options.visible ? {} : { display: "none" }
    },
    htmlProps
  );
}
