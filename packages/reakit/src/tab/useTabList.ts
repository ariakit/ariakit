import { unstable_useHook } from "../theme/useHook";
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
  props: unstable_UseTabListProps = {}
) {
  props = mergeProps(
    {
      role: "tablist"
    } as typeof props,
    props
  );
  props = useBox(options, props);
  props = unstable_useHook("useTabList", options, props);
  return props;
}

const keys: Array<keyof unstable_UseTabListOptions> = [
  ...useBox.keys,
  ...useTabState.keys
];

useTabList.keys = keys;
