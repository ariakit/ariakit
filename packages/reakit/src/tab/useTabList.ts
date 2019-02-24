import { useHook } from "../theme/_useHook";
import { mergeProps } from "../utils/mergeProps";
import { useUl } from "../html";
import { UseBoxOptions, UseBoxProps } from "../box/useBox";
import { useTabState, TabState, TabSelectors, TabActions } from "./useTabState";

export type UseTabListOptions = UseBoxOptions &
  Partial<TabState & TabSelectors & TabActions>;

export type UseTabListProps = UseBoxProps;

export function useTabList(
  options: UseTabListOptions = {},
  props: UseTabListProps = {}
) {
  props = mergeProps(
    {
      role: "tablist"
    } as typeof props,
    props
  );
  props = useUl(options, props);
  props = useHook("useTabList", options, props);
  return props;
}

const keys: Array<keyof UseTabListOptions> = [
  ...useUl.keys,
  ...useTabState.keys
];

useTabList.keys = keys;
