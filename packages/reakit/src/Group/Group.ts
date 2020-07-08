import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { BoxOptions, BoxHTMLProps, useBox } from "../Box/Box";
import { GROUP_KEYS } from "./__keys";

export type GroupOptions = BoxOptions;

export type GroupHTMLProps = BoxHTMLProps;

export type GroupProps = GroupOptions & GroupHTMLProps;

export const useGroup = createHook<GroupOptions, GroupHTMLProps>({
  name: "Group",
  compose: useBox,
  keys: GROUP_KEYS,

  useProps(_, htmlProps) {
    return { role: "group", ...htmlProps };
  },
});

export const Group = createComponent({
  as: "div",
  useHook: useGroup,
});
