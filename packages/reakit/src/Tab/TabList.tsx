import { warning } from "../__utils/warning";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { unstable_BoxOptions, unstable_BoxProps, useBox } from "../Box/Box";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { Keys } from "../__utils/types";
import { useTabState, unstable_TabStateReturn } from "./TabState";

export type unstable_TabListOptions = unstable_BoxOptions &
  Partial<unstable_TabStateReturn>;

export type unstable_TabListProps = unstable_BoxProps;

export function useTabList(
  options: unstable_TabListOptions,
  htmlProps: unstable_TabListProps = {}
) {
  options = unstable_useOptions("useTabList", options, htmlProps);
  htmlProps = mergeProps(
    {
      role: "tablist",
      "aria-orientation": options.orientation
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useBox(options, htmlProps);
  htmlProps = unstable_useProps("useTabList", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_TabListOptions> = [
  ...useBox.__keys,
  ...useTabState.__keys
];

useTabList.__keys = keys;

export const TabList = unstable_createComponent({
  as: "div",
  useHook: useTabList,
  useCreateElement: (type, props, children) => {
    warning(
      !props["aria-label"] && !props["aria-labelledby"],
      `You should provide either \`aria-label\` or \`aria-labelledby\` props.
See https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_roles_states_props-20`,
      "TabList"
    );
    return unstable_useCreateElement(type, props, children);
  }
});
