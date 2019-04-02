import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { useHiddenState, unstable_HiddenStateReturn } from "./HiddenState";

export type unstable_HiddenOptions = unstable_BoxOptions &
  Partial<unstable_HiddenStateReturn>;

export type unstable_HiddenProps = unstable_BoxProps;

export function useHidden(
  options: unstable_HiddenOptions = {},
  htmlProps: unstable_HiddenProps = {}
) {
  options = unstable_useOptions("useHidden", options, htmlProps);
  htmlProps = mergeProps(
    {
      role: "region",
      id: options.unstable_hiddenId,
      hidden: !options.visible,
      "aria-hidden": !options.visible
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useProps("useHidden", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_HiddenOptions> = [
  ...useBox.__keys,
  ...useHiddenState.__keys
];

useHidden.__keys = keys;

export const Hidden = unstable_createComponent({
  as: "div",
  useHook: useHidden
});
