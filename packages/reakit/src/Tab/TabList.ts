import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { useTabState, unstable_TabStateReturn } from "./TabState";

export type unstable_TabListOptions = unstable_BoxOptions &
  Partial<unstable_TabStateReturn>;

export type unstable_TabListProps = unstable_BoxProps;

export function useTabList(
  options: unstable_TabListOptions = {},
  htmlProps: unstable_TabListProps = {}
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

const keys: Array<keyof unstable_TabListOptions> = [
  ...useBox.keys,
  ...useTabState.keys
];

useTabList.keys = keys;

export const TabList = unstable_createComponent("ul", useTabList);
