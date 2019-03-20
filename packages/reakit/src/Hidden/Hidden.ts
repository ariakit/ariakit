import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { useHiddenState, unstable_HiddenStateReturn } from "./HiddenState";

export type unstable_HiddenOptions = unstable_BoxOptions &
  Partial<unstable_HiddenStateReturn>;

export type unstable_HiddenProps = unstable_BoxProps;

export function useHidden(
  options: unstable_HiddenOptions = {},
  htmlProps: unstable_HiddenProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "region",
      id: options.hiddenId,
      hidden: !options.visible,
      "aria-hidden": !options.visible
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = useHook("useHidden", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_HiddenOptions> = [
  ...useBox.keys,
  ...useHiddenState.keys
];

useHidden.keys = keys;

export const Hidden = unstable_createComponent("div", useHidden);
