import { HiddenProps, HiddenOptions } from "reakit/Hidden/Hidden";
import { mergeProps } from "reakit/utils/mergeProps";
import { BootstrapBoxOptions } from "./Box";

export type BootstrapHiddenOptions = BootstrapBoxOptions & HiddenOptions;

export function useHiddenProps(
  options: BootstrapHiddenOptions,
  htmlProps: HiddenProps = {}
) {
  return mergeProps(
    {
      style: options.visible ? {} : { display: "none" }
    },
    htmlProps
  );
}
