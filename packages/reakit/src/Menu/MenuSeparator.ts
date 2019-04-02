import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  unstable_SeparatorOptions,
  unstable_SeparatorProps,
  useSeparator
} from "../Separator/Separator";
import { Keys } from "../__utils/types";
import { useMenuState, unstable_MenuStateReturn } from "./MenuState";

export type unstable_MenuSeparatorOptions = unstable_SeparatorOptions &
  Partial<unstable_MenuStateReturn>;

export type unstable_MenuSeparatorProps = unstable_SeparatorProps;

export function useMenuSeparator(
  options: unstable_MenuSeparatorOptions,
  htmlProps: unstable_MenuSeparatorProps = {}
) {
  options = unstable_useOptions("useMenuSeparator", options, htmlProps);
  htmlProps = useSeparator(options, htmlProps);
  htmlProps = unstable_useProps("useMenuSeparator", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_MenuSeparatorOptions> = [
  ...useSeparator.__keys,
  ...useMenuState.__keys
];

useMenuSeparator.__keys = keys;

export const MenuSeparator = unstable_createComponent({
  as: "hr",
  useHook: useMenuSeparator
});
