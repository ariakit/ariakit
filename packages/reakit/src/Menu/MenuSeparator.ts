import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  SeparatorOptions,
  SeparatorProps,
  useSeparator
} from "../Separator/Separator";
import { Keys } from "../__utils/types";
import { useMenuState, MenuStateReturn } from "./MenuState";

export type MenuSeparatorOptions = SeparatorOptions;

export type MenuSeparatorProps = SeparatorProps;

export function useMenuSeparator(
  options: MenuSeparatorOptions,
  htmlProps: MenuSeparatorProps = {}
) {
  options = unstable_useOptions("useMenuSeparator", options, htmlProps);
  htmlProps = useSeparator(options, htmlProps);
  htmlProps = unstable_useProps("useMenuSeparator", options, htmlProps);
  return htmlProps;
}

const keys: Keys<MenuStateReturn & MenuSeparatorOptions> = [
  ...useSeparator.__keys,
  ...useMenuState.__keys
];

useMenuSeparator.__keys = keys;

export const MenuSeparator = unstable_createComponent({
  as: "hr",
  useHook: useMenuSeparator
});
