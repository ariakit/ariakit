import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useProps } from "../system/useProps";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { unstable_useOptions } from "../system";

export type unstable_GroupOptions = unstable_BoxOptions;

export type unstable_GroupProps = unstable_BoxProps;

export function useGroup(
  options: unstable_GroupOptions = {},
  htmlProps: unstable_GroupProps = {}
) {
  options = unstable_useOptions("useGroup", options, htmlProps);
  htmlProps = mergeProps({ role: "group" } as typeof htmlProps, htmlProps);
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useProps("useGroup", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_GroupOptions> = [...useBox.__keys];

useGroup.__keys = keys;

export const Group = unstable_createComponent({
  as: "div",
  useHook: useGroup
});
