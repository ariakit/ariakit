import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { unstable_useProps } from "../system/useProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { Keys } from "../__utils/types";
import { unstable_useOptions } from "../system";

export type GroupOptions = BoxOptions;

export type GroupProps = BoxProps;

export function useGroup(
  options: GroupOptions = {},
  htmlProps: GroupProps = {}
) {
  options = unstable_useOptions("useGroup", options, htmlProps);
  htmlProps = mergeProps({ role: "group" } as typeof htmlProps, htmlProps);
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useProps("useGroup", options, htmlProps);
  return htmlProps;
}

const keys: Keys<GroupOptions> = [...useBox.__keys];

useGroup.__keys = keys;

export const Group = unstable_createComponent({
  as: "div",
  useHook: useGroup
});
