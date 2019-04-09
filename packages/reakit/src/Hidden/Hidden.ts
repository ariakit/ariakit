import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { useHiddenState, HiddenStateReturn } from "./HiddenState";

export type HiddenOptions = BoxOptions & Partial<HiddenStateReturn>;

export type HiddenProps = BoxProps;

export function useHidden(
  options: HiddenOptions = {},
  htmlProps: HiddenProps = {}
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

const keys: Keys<HiddenOptions> = [...useBox.__keys, ...useHiddenState.__keys];

useHidden.__keys = keys;

export const Hidden = unstable_createComponent({
  as: "div",
  useHook: useHidden
});
