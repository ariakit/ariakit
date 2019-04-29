import { unstable_createComponent } from "../utils/createComponent";
import { mergeProps } from "../utils/mergeProps";
import { BoxOptions, BoxProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";

export type GroupOptions = BoxOptions;

export type GroupProps = BoxProps;

export const useGroup = unstable_createHook<GroupOptions, GroupProps>({
  name: "Group",
  compose: useBox,

  useProps(_, htmlProps) {
    return mergeProps({ role: "group" } as GroupProps, htmlProps);
  }
});

export const Group = unstable_createComponent({
  as: "div",
  useHook: useGroup
});
