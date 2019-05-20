import { unstable_createComponent } from "../utils/createComponent";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { unstable_createHook } from "../utils/createHook";

export type GroupOptions = BoxOptions;

export type GroupHTMLProps = BoxHTMLProps;

export type GroupProps = GroupOptions & GroupHTMLProps;

export const useGroup = unstable_createHook<GroupOptions, GroupHTMLProps>({
  name: "Group",
  compose: useBox,

  useProps(_, htmlProps) {
    return { role: "group", ...htmlProps };
  }
});

export const Group = unstable_createComponent({
  as: "div",
  useHook: useGroup
});
