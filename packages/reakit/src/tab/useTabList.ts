import { unstable_useHook } from "../system/useHook";
import { mergeProps } from "../utils/mergeProps";
import {
  unstable_UseBoxOptions,
  unstable_UseBoxProps,
  useBox
} from "../box/useBox";
import {
  useTabState,
  unstable_TabState,
  unstable_TabSelectors,
  unstable_TabActions
} from "./useTabState";

export type unstable_UseTabListOptions = unstable_UseBoxOptions &
  Partial<unstable_TabState & unstable_TabSelectors & unstable_TabActions>;

export type unstable_UseTabListProps = unstable_UseBoxProps;

export function useTabList(
  options: unstable_UseTabListOptions = {},
  htmlProps: unstable_UseTabListProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "tablist"
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useHook("useTabList", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_UseTabListOptions> = [
  ...useBox.keys,
  ...useTabState.keys
];

useTabList.keys = keys;
